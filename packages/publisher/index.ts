import type { Init, CommandModule, Emitter, Logging } from '@sern/handler'
import { controller, CommandInitPlugin } from '@sern/handler'
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
    if (type !== 1 && desc !== '') {
        console.warn('Found context menu that has non empty description field. Implictly publishing with empty description');
        return '';
    }
    return desc;
};

const serializePermissions = (permissions: unknown) => {
    if(typeof permissions === 'bigint' || typeof permissions === 'number') {
       return permissions.toString(); 
    }

    if(Array.isArray(permissions)) {
        return permissions
            .reduce((acc, cur) => acc | cur, BigInt(0))
            .toString()
    }
    return null;
}

const BASE_URL = new URL('https://discord.com/api/v10/applications/');
const PUBLISHABLE = 0b1110;
const PUBLISH = Symbol.for('@sern/publish')
export class Publisher implements Init {
    constructor(private modules: Map<string, CommandModule>,
                private sernEmitter : Emitter,
                private logger: Logging) {}

    async init() {
        if(!process.env.DISCORD_TOKEN) {
            throw Error("No token found to publish. add DISCORD_TOKEN to .env");
        }
        const headers = {
            Authorization: 'Bot ' + process.env.DISCORD_TOKEN,
            'Content-Type': 'application/json',
        };
        let me; let appid: string;
        try {
            me = await fetch(new URL('@me', BASE_URL), { headers }).then(res => res.json());
            appid = me.id;
        } catch(e) {
            console.log("Something went wrong while trying to fetch your application:");
            throw e;
        }
        const GLOBAL_URL = new URL(`${appid}/commands`, BASE_URL);

        const listener = async () => {
            this.logger.info({ message: 'publishing modules' });
            const modules = 
                Array.from(this.modules.values())
                     .filter(module => (module.type & PUBLISHABLE) != 0)
                     .map(module => {
                        return {
                            //@ts-ignore
                            [PUBLISH]: module[PUBLISH],
                            toJSON() {
                                const applicationType = intoApplicationType(module.type);
                                const { default_member_permissions,    
                                        integration_types,//@ts-ignore
                                        contexts } = module[PUBLISH] ?? {};
                                return {
                                    name: module.name, type: applicationType,
                                    //@ts-ignore 
                                    description: makeDescription(applicationType, module.description),
                                    //@ts-ignore shutup
                                    options: optionsTransformer(module?.options),
                                    default_member_permissions,
                                    integration_types: (integration_types ?? ['Guild']).map(
                                        (s: string) => {
                                            if(s === "Guild") return "0";
                                            else if (s == "User") return "1";
                                            else throw Error("IntegrationType is not one of Guild or User");
                                        }),
                                    contexts,
                                    //@ts-ignore
                                    name_localizations: module.name_localizations, 
                                    //@ts-ignore
                                    description_localizations: module.description_localizations
                                }
                            }
                        }
                     })
            const [globalCommands, guildedCommands] = modules.reduce(
                ([globals, guilded], module) => {
                    const isPublishableGlobally = !module[PUBLISH] || !Array.isArray(module[PUBLISH].guildIds);
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
                this.logger.info({ message: "published all global commands" })
            } else {
                this.logger.info({ message: inspect(globalJsonBody, false, Infinity ) })
                //todo: implement rate limiting
            }
            const guildIdMap: Map<string, CommandModule[]> = new Map();
            const responsesMap = new Map();
            guildedCommands.forEach((entry) => {
                const guildIds: string[] = entry[PUBLISH].guildIds ?? []; 
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

export type ValidMemberPermissions = 
    | typeof PermissionFlagsBits  //discord.js enum
    | Array<typeof PermissionFlagsBits> 
    | string //must be a stringified number
    | bigint

export interface PublishConfig {
    guildIds?: string[];
    defaultMemberPermissions?: ValidMemberPermissions;
    integrationTypes?: Array<'Guild'|'User'>
    contexts?: number[]
}

export type ValidPublishOptions = 
    | PublishConfig
    | ((absPath: string, module: CommandModule) => PublishConfig)

/**
  * the publishConfig plugin.
  * If your commandModule requires extra properties such as publishing for certain guilds, you would
  * put those options in there.
  * @param {ValidPublishOptions} config options to configure how this module is published
  */
export const publishConfig = (config: ValidPublishOptions) => {
    return CommandInitPlugin(({ module, absPath }) => { 
        if((module.type & PUBLISHABLE) === 0) {
            //@ts-ignore
            return controller.stop("Cannot publish this module");
        }
        let _config=config
        if(typeof _config === 'function') {
            //@ts-ignore fix later
           _config = _config(absPath, module);
        }
        const { contexts, defaultMemberPermissions, integrationTypes } = _config
        //adding extra configuration
        Reflect.set(module, PUBLISH, {
            guildIds: _config.guildIds,
            default_member_permissions: serializePermissions(defaultMemberPermissions),
            integration_types: integrationTypes,
            contexts
        })
        return controller.next();
    }) 
}

