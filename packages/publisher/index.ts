import type { Init, CommandModule, Emitter, Logging } from '@sern/handler'
import { controller, CommandInitPlugin } from '@sern/handler'

const optionsTransformer = (ops: Array<{ type: number }>) => {
    return ops.map((el) => {
        if ('command' in el) {
            const { command, ...rest } = el;
            return rest;
        }
        return el;
    });
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
const IS_GUILDED = Symbol.for('@@guilded')
const IS_GLOBAL = Symbol.for('@@global')

export class Publisher implements Init {
    constructor(
        private modules: Map<string, CommandModule>,
        private sernEmitter : Emitter,
        private logger: Logging
    ) {}

    async init() {
        const headers = {
            Authorization: 'Bot ' + process.env.DISCORD_TOKEN,
            'Content-Type': 'application/json',
        };
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
        this.sernEmitter.addListener('modulesLoaded', () => {
            this.logger.info({ message: 'publishing modules' });
            const modules = Array.from(this.modules.values())
                                 .filter(module => (module.type & PUBLISHABLE) != 0)
            const [globalCommands, guildedCommands] = modules.reduce(
                ([globals, guilded], module) => {
                    //@ts-ignore
                    const isPublishableGlobally = module[IS_GLOBAL];
                    if (isPublishableGlobally) {
                        return [[module, ...globals], guilded];
                    }
                    return [globals, [module, ...guilded]];
                }, [[], []] as [CommandModule[], CommandModule[]]);
        })
    }
}

type ValidMemberPermissions = 
    | string //must be a stringified number
    | bigint

interface PublishConfig {
    guildIds?: string[];
    defaultMemberPermissions: ValidMemberPermissions;
}

type ValidPublishOptions = 
    | PublishConfig
    | ((absPath: string, module: CommandModule) => PublishConfig)


export const serialize = (config: ValidPublishOptions) => {

    return CommandInitPlugin(({ module, absPath }) => { 
        let _config=config
         if(typeof _config === 'function') {
            _config = _config(absPath, module);
         }
         if(_config.guildIds) {
            Reflect.set(module, IS_GUILDED, true)
         } else {
            Reflect.set(module, IS_GLOBAL, true)
         }
         Reflect.set(module, 'toJSON', function () {
                const applicationType = intoApplicationType(module.type);
                return {
                    name: module.name,
                    type: applicationType,
                    description: makeDescription(applicationType, module.description),
                    options: optionsTransformer(module?.options ?? []),
                    default_member_permissions: serializePermissions(config?.defaultMemberPermissions),
                    //@ts-ignore
                    integration_types: (config?.integrationTypes ?? ['Guild']).map(
                        (s: string) => {
                            if(s === "Guild") {
                                return "0";
                            } else if (s == "User") {
                                return "1";
                            } else {
                                throw Error("IntegrationType is not one of Guild or User");
                            }
                        }),
                    //@ts-ignore
                    contexts: config?.contexts ? config.contexts : undefined
                }
         })
         return controller.next();
    }) 
}

