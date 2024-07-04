/**
 * A semi-generic container that provides error handling, emitter, and module store. 
 * For the handler to operate correctly, The only user provided dependency needs to be @sern/client
 */
function hasCallableMethod(obj: object, name: PropertyKey) {
    //@ts-ignore
    return typeof obj[name] == 'function';
}
/**
 * A Depedency injection container capable of adding singletons, firing hooks, and managing IOC within an application
 */
export class Container {
    private __singletons = new Map<PropertyKey, any>();
    //hooks are Maps of string -> object, where object is a reference to an object in __singletons
    private hooks= new Map<string, object[]>();
    private finished_init = false;
    constructor(options: { autowire: boolean; path?: string }) {
        if(options.autowire) { /* noop */ }
    }
    
    addHook(name: string, callback: object) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name)!.push(callback);
    }
    private registerHooks(hookname: string, insert: object) {

        if(hasCallableMethod(insert, hookname)) {
            //@ts-ignore
            this.addHook(hookname, insert)
        }
    }

    addSingleton(key: string, insert: object) {
        if(typeof insert !== 'object') {
            throw Error("Inserted object must be an object");
        }
        if(!this.__singletons.has(key)) {
            this.registerHooks('init', insert)
            this.registerHooks('dispose', insert)
            this.__singletons.set(key, insert);
            return true;    
        }
        return false;
    }

    addWiredSingleton(key: string, fn: (c: Record<string,unknown>) => object) {
        const insert = fn(this.deps());
        return this.addSingleton(key, insert);
    }

    async disposeAll() {
        await this.executeHooks('dispose');
        this.hooks.delete('dispose');
    }

    isReady() { return this.finished_init; }
    hasKey(key: string) { return this.__singletons.has(key); }
    get<T>(key: PropertyKey) : T|undefined { return this.__singletons.get(key); }

    async ready() {
        await this.executeHooks('init');
        this.hooks.delete('init');
        this.finished_init = true;
    }

    deps<T extends Record<string,any>>(): T {
        return Object.fromEntries(this.__singletons) as T
    }

    async executeHooks(name: string, args: any[] = []) {
        const hookFunctions = this.hooks.get(name) || [];
        for (const hookObject of hookFunctions) {
            //@ts-ignore .registerHooks verifies the hookObject hasCallableMethod
            hookObject[name](...args);
        }
    }

    swap(key: string, swp: object) {
        if (typeof swp !== 'object') {
            throw Error("Inserted object must be an object");
        }

        const existing = this.__singletons.get(key);
        if (!existing) {
            return false;
        }
        // check if there's dispose hook, and call it
        if (hasCallableMethod(existing, 'dispose')) {
            //this should technically be awaited to ensure synchronicity of swap 
            // but i dont want to ruin the function signature of swap.
            existing.dispose();
            // get the index of the existing singleton, now delete the dispose hook at that index
            // .indexOf is safe because we only store singletons, and it should be a reference to 
            // the original object in this.__singletons
            const hookIndex = this.hooks.get('dispose')!.indexOf(existing);
            if (hookIndex > -1) {
                this.hooks.get('dispose')!.splice(hookIndex, 1);
            }
        }

        this.__singletons.set(key, swp);
        this.registerHooks('init', swp);
        return true;
    }
}
