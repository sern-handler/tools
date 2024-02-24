
import { Container } from '../src/container';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CoreContainer Tests', () => {
    let coreContainer: Container;

    beforeEach(() => {
        coreContainer = new Container({ autowire: false });
    });

    it('Adding and getting singletons', () => {
        coreContainer.addSingleton('singletonKey', { value: 'singletonValue' });
        const singleton = coreContainer.get('singletonKey');
        expect(singleton).toEqual({ value: 'singletonValue' });
    });


    it('Checking if container is ready', () => {
        expect(coreContainer.isReady()).toBe(false);
        coreContainer.ready().then(() => {
            expect(coreContainer.isReady()).toBe(true);
        });
    });

    it('Adding and getting singletons - async', async () => {
        await coreContainer.ready();
        coreContainer.addSingleton('asyncSingletonKey', { value: 'asyncSingletonValue' });
        const singleton = coreContainer.get('asyncSingletonKey');
        expect(singleton).toEqual({ value: 'asyncSingletonValue' });
    })
    it('Registering and executing hooks - init should be called once after ready', async () => {
        let initCount = 0;

        const singletonWithInit = {
            value: 'singletonValueWithInit',
            init: async () => {
                initCount++;
            }
        };

        coreContainer.addSingleton('singletonKeyWithInit', singletonWithInit);

        // Call ready twice to ensure hooks are executed only once
        await coreContainer.ready();
        await coreContainer.ready();

        expect(initCount).toBe(1);
    });

    it('Registering and executing hooks - ', async () => {
        let initCount = 0;

        const singletonWithInit = {
            value: 'singletonValueWithInit',
            init: async () => {
                initCount++;
            }
        };

        coreContainer.addSingleton('singletonKeyWithInit', singletonWithInit);

        // Call ready twice to ensure hooks are executed only once
        await coreContainer.ready();
        await coreContainer.ready();

        expect(initCount).toBe(1);
    });


    it('wired singleton', async () => {
        let fn = vi.fn()
        const wiredSingletonFn = (container: Container) => {
            return { value: 'wiredSingletonValue', init: fn };
        };
        const added = coreContainer.addWiredSingleton('wiredSingletonKey', wiredSingletonFn);
        expect(added).toBe(true);
        const wiredSingleton = coreContainer.get('wiredSingletonKey');
        expect(wiredSingleton).toEqual({ value: 'wiredSingletonValue', init: fn });
        await coreContainer.ready() 
        await coreContainer.ready() 
        //@ts-ignore
        expect(wiredSingleton.init).toHaveBeenCalledOnce();
    })

    it('dispose', async () => {
        let dfn = vi.fn();
        const wiredSingletonFn =  { value: 'wiredSingletonValue', dispose: dfn };
        coreContainer.addSingleton('sk', wiredSingletonFn);
        //@ts-ignore
        await coreContainer.disposeAll();

        expect(dfn).toHaveBeenCalledOnce()
    })

})
