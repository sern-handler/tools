import assert from "assert";
import { hasCallableMethod } from "./hooks";
import {  } from 'node:fs/promises'

/**
 * A Depedency injection container capable of adding singletons, firing hooks, and managing IOC within an application
 */
export class Container {
    private __singletons = new Map<PropertyKey, any>();
    private hooks= new Map<string, Function[]>();
    private finished_init = false;
    constructor(options: { autowire: boolean; path?: string }) {
        if(options.autowire) { /* noop */ }
    }
    
    addHook(name: string, callback: Function) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name)!.push(callback);
    }
    private registerHooks(hookname: string, insert: object) {
        if(hasCallableMethod(insert, hookname)) {
            console.log(insert)
            //@ts-ignore
            this.addHook(hookname, () => insert[hookname]())
        }
    }
    addSingleton(key: string, insert: object) {
        assert(typeof insert === 'object')
        if(!this.__singletons.has(key)){
            this.registerHooks('init', insert)
            this.registerHooks('dispose', insert)
            this.__singletons.set(key, insert);
            return true;    
        }
        return false;
    }

    addWiredSingleton(key: string, fn: (c: Container) => object) {
        const insert = fn(this);
        assert(typeof insert === 'object')
        if(!this.__singletons.has(key)){
            this.registerHooks('init', insert)
            this.registerHooks('dispose', insert)
            this.__singletons.set(key, insert);
            return true;    
        }
        return false;
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

    async executeHooks(name: string) {
        const hookFunctions = this.hooks.get(name) || [];
        console.log(hookFunctions)
        for (const hookFunction of hookFunctions) {
            await hookFunction();
        }
    }
}

