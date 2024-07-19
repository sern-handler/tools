import type { Init, Emitter, Logging, Module, CommandModule } from '@sern/handler'
import { controller, CommandInitPlugin, CommandType } from '@sern/handler'
import { writeFile } from 'node:fs/promises';
import { inspect } from 'node:util';
import type { PermissionFlagsBits } from 'discord.js'

const optionsTransformer = (ops?: Array<{ type: number }>) => {
    return ops?.map((el) => {
        if ('command' in el) {
            const { command, ...rest } = el;
            return rest;
        }
        return el;
    }) ?? [];
};

const intoApplicationType = (type: number) => 
    type === 3 ? 1 : Math.log2(type);

const makeDescription = (type: number, desc: string) => {
    if (type !== CommandType.Text && desc !== '') {
        console.warn('Found context menu that has non empty description field. Implictly publishing with empty description');
        return '';
    }
    return desc;
};

const serializePerms = (perms: unknown) => {
    if(typeof perms === 'bigint' || typeof perms === 'number') {
       return perms.toString(); 
    }

    if(Array.isArray(perms)) {
        return perms.reduce((acc, cur) => acc|cur, BigInt(0))
                    .toString()
    }
    return null;
}

const BASE_URL = new URL('https://discord.com/api/v10/applications/');
const PUBLISHABLE = 0b1110;

export class Publisher implements Init {
    constructor(private modules: Map<string, Module>,
                private sernEmitter : Emitter,
                private logger: Logging) {}

    async init() {
        if(!process.env.DISCORD_TOKEN) {
            throw Error("No token found to publish. add DISCORD_TOKEN to .env");
        }
        const headers = [['Authorization', 'Bot ' + process.env.DISCORD_TOKEN],
                         ['Content-Type', 'application/json']] as Array<[string,string]>
        let me; 
        let appid: string;
        try {
            me = await fetch(new URL('@me', BASE_URL), { headers }).then(res => res.json());
            appid = me.id;
        } catch(e) {
            console.log("Something went wrong while trying to fetch your application:");
            throw e;
        }
        const GLOBAL_URL = new URL(`${appid}/commands`, BASE_URL);
        interface LocalPublish {
            guildIds?: string[]
            default_member_permissions: string,
            integration_types: string[],
            contexts: number[]
        }
        const listener = async () => {
            this.logger.info({ message: 'publishing modules' });
            const modules = 
                Array.from(this.modules.values())
                     .filter(module => (module.type & PUBLISHABLE) != 0)
                     .map(module => {
                        const publish = module.locals.publish as LocalPublish || {}
                        return {
                            guildIds: publish?.guildIds ?? [],
                            toJSON() {
                                const applicationType = intoApplicationType(module.type);
                                const { default_member_permissions,    
                                        integration_types,
                                        contexts } = publish;
                                return {
                                    name: module.name, type: applicationType,
                                    //@ts-ignore we know description is at least empty str or filled
                                    description: makeDescription(applicationType, module.description),
                                    //@ts-ignore shutup
                                    options: optionsTransformer(module?.options),
                                    default_member_permissions,
                                    integration_types, contexts,
                                    //@ts-ignore
                                    name_localizations: module.locals.nloc, 
                                    //@ts-ignore
                                    description_localizations: module.locals.dloc
                                }
                            }
                        }
                     })
            const [globalCommands, guildedCommands] = modules.reduce(
                //technically these aren't sern/handler modules. 
                ([globals, guilded], module) => {
                    const isPublishableGlobally = !module.guildIds || module.guildIds.length === 0;
                    if (isPublishableGlobally) {
                        return [[module, ...globals], guilded];
                    }
                    return [globals, [module, ...guilded]];
                }, [[], []] as [any[], any[]]);

            const resultGlobal = await fetch(GLOBAL_URL, { 
                method: 'PUT',
                headers,
                body: JSON.stringify(globalCommands)
            })
            const globalJsonBody = await resultGlobal.json();
            if(resultGlobal.ok) {
                this.logger.info({ message: "Publisher: All global commands published." })
            } else {
                this.logger.info({ message: inspect(globalJsonBody, false, Infinity ) })
                //todo: implement rate limiting
            }
            const guildIdMap: Map<string, Module[]> = new Map();
            const responsesMap = new Map();
            guildedCommands.forEach((entry) => {
                const guildIds: string[] = entry.guildIds ?? []; 
                if (guildIds) {
                    guildIds.forEach((guildId) => {
                        if (guildIdMap.has(guildId)) {
                            guildIdMap.get(guildId)?.push(entry);
                        } else {
                            guildIdMap.set(guildId, [entry]);
                        }
                    });
                }
            });
            for (const [guildId, array] of guildIdMap.entries()) {
                const guildCommandURL = new URL(`${appid}/guilds/${guildId}/commands`, BASE_URL);
                const response = await fetch(guildCommandURL, {
                    method: 'PUT',
                    body: JSON.stringify(array),
                    headers,
                });
                const result = await response.json();
                if (response.ok) {
                    this.logger.info({ message: guildId + " published succesfully" })
                    responsesMap.set(guildId, result);
                } else {
                    switch(response.status) {
                        case 400 : {
                            console.error(inspect(result, { depth: Infinity }))
                            console.error("Modules with validation errors:" 
                            + inspect(Object.keys(result.errors).map(idx => array[idx as any])))
                            throw Error("400: Ensure your commands have proper fields and data and nothing left out");
                        }
                        case 404 : {
                            console.error(inspect(result, { depth: Infinity }))
                            throw Error("Forbidden 404. Is you application id and/or token correct?")
                        }
                        case 429: {
                            console.error(inspect(result, { depth: Infinity }))
                            throw Error('Chill out homie, too many requests')
                        }
                    }
                }
            }
            await writeFile(
                '.sern/command-data-remote.json',
                JSON.stringify({ global: globalJsonBody,
                               ...Object.fromEntries(responsesMap) }, null, 4),
                'utf8')
        }
        this.sernEmitter.addListener('modulesLoaded', () => { 
            listener(); 
            this.sernEmitter.removeListener('modulesLoaded', listener);
        })
    }
}

export enum IntegrationContextType {
  GUILD = 0,
  BOT_DM = 1,
  PRIVATE_CHANNEL = 2
}

type Contexts = IntegrationContextType | 0 | 1 | 2;

export type ValidMemberPermissions = 
    | typeof PermissionFlagsBits  //discord.js enum
    | Array<typeof PermissionFlagsBits> 
    | string //must be a stringified number
    | bigint

export interface PublishConfig {
    guildIds?: string[];
    defaultMemberPermissions?: ValidMemberPermissions;
    integrationTypes?: Array<'Guild'|'User'>;
    contexts?: Array<Contexts>;
}

export type ValidPublishOptions = 
    | PublishConfig
    | ((absPath: string, module: CommandModule) => PublishConfig)

const IntegrationType = {
    Guild: '0', User: '1'
}
/**
  * the publishConfig plugin.
  * If your commandModule requires extra properties such as publishing for certain guilds, you would
  * put those options in there.
  * sets 'publish' on locals field for modules.
  * @param {ValidPublishOptions} config options to configure how this module is published
  */
export const publishConfig = (config: ValidPublishOptions) => {
    return CommandInitPlugin(({ module, absPath }) => { 
        if((module.type & PUBLISHABLE) === 0) {
            //@ts-ignore
            return controller.stop("Cannot publish this module; Not of type Both,Slash,CtxUsr,CtxMsg.");
        }
        let _config=config
        if(typeof _config === 'function') {
           _config = _config(absPath, module as CommandModule);
        }
        const { contexts, defaultMemberPermissions, integrationTypes:integration_types, guildIds } = _config
        Reflect.set(module.locals, 'publish', {
            guildIds,
            contexts, 
            integration_types: integration_types?.map(i => Reflect.get(IntegrationType, i)),
            default_member_permissions: serializePerms(defaultMemberPermissions),
        })
        return controller.next();
    }) 
}

