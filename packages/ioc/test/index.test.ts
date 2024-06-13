
import { Container } from '../src/container';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

describe('CoreContainer Tests', () => {
    let coreContainer: Container;
    let singletonWInit: { init: Mock<any, any>; value: string }
    let singletonWDispose: { dispose: Mock<any, any>; value: string }
    beforeEach(() => {
        coreContainer = new Container({ autowire: false });
        singletonWInit = {
        value: 'singletonWithInit',
        init: vi.fn()
        };
        singletonWDispose = {
            value: 'singletonWithDispose',
            dispose: vi.fn()
        }
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
        const wiredSingletonFn = (container: unknown) => {
            return { value: 'wiredSingletonValue', init: fn };
        };
        const added = coreContainer.addWiredSingleton('wiredSingletonKey', wiredSingletonFn);
        expect(added).toBe(true);

        const wiredSingleton = coreContainer.get<Record<string, unknown>>('wiredSingletonKey')!;
        expect(wiredSingleton).toEqual({ value: 'wiredSingletonValue', init: fn });

        await coreContainer.ready();
        await coreContainer.ready();

        expect(wiredSingleton.init).toHaveBeenCalledOnce();
    })

    it('dispose', async () => {
        let dfn = vi.fn()
        let count = 0;
        const wiredSingletonFn =  { value: 'wiredSingletonValue', dispose: dfn };
        const added = coreContainer.addSingleton('sk', wiredSingletonFn);
        expect(added).toBe(true);

        await coreContainer.disposeAll();
        await coreContainer.disposeAll();

        expect(dfn).toHaveBeenCalledOnce()
    })

    it('Checking if container is ready - async', async () => {
        expect(coreContainer.isReady()).toBe(false);
        await coreContainer.ready();
        expect(coreContainer.isReady()).toBe(true);
    });

    it('Registering and executing hooks - init should be called once after ready', async () => {

        coreContainer.addSingleton('singletonKeyWithInit', singletonWInit);

        // Call ready twice to ensure hooks are executed only once
        await coreContainer.ready();
        await coreContainer.ready();

        expect(singletonWInit.init).toHaveBeenCalledOnce();
    });

    it('should be false because not swapping anything', () => {
        const swap = coreContainer.swap('singletonKeyWithInit', singletonWInit);
        expect(swap).toBe(false);
    })

    it('should swap object with another', () => {
        coreContainer.addSingleton('singleton', singletonWInit)
        const singletonWithInit2 = {
            value: 'singletonValueWithInit2',
            init: vi.fn()
        };
        coreContainer.swap('singleton', singletonWithInit2)
        expect(coreContainer.get<Record<string, unknown>>('singleton')).toBe(singletonWithInit2)
    })

    it('should swap object, calling dispose hook', () => {
        coreContainer.addSingleton('singleton', singletonWDispose);
        const singletonWithDispose2 = {
            value: 'singletonValueWithDispose2',
            dispose: vi.fn()
        };

        const singletonWithDispose3 = {
            value: 'singletonValueWithDispose3',
            dispose: vi.fn()
        };

        coreContainer.addSingleton('singletonWithDispose3', singletonWithDispose3);
        const swapped = coreContainer.swap('singleton', singletonWithDispose2);

        expect(singletonWDispose.dispose).toHaveBeenCalledOnce();
        expect(coreContainer.get<Record<string, unknown>>('singleton')).toBe(singletonWithDispose2);
        expect(singletonWithDispose2.dispose).not.toHaveBeenCalledOnce();
        expect(singletonWithDispose3.dispose).not.toHaveBeenCalledOnce();
        expect(swapped).toBe(true);
    })
})
