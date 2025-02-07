import { Container } from '../src';
import { describe, it, expect, beforeEach, vi, Mock, afterEach } from 'vitest';

class SingletonCheese { 
    dispose() {
        return this.value
    }
    constructor(public value: string){}
}
describe('CoreContainer Tests', () => {
    let coreContainer: Container;
    let singletonWInit: { init: Mock<any, any>; value: string }
    let singletonWDispose: SingletonCheese 
    beforeEach(() => {
        coreContainer = new Container({ autowire: false });
        singletonWInit = {
            value: 'singletonWithInit',
            init: vi.fn()
        };
        singletonWDispose = new SingletonCheese('singletonWithDispose')
    });

    afterEach(() => {
        vi.clearAllMocks() 
    })

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

    it('calls user defined hook', async () => {
        class S { 
            schedule = vi.fn() 
        }
        const s = new S()
        coreContainer.addSingleton('abc', s)
        coreContainer.addHook('schedule', s)
        await coreContainer.executeHooks('schedule')
        expect(s.schedule).toHaveBeenCalledOnce()
    })

    it('calls user defined hook with args', async () => {
        class S { 
            schedule = vi.fn() 
        }
        const s = new S()
        coreContainer.addSingleton('abc', s)
        coreContainer.addHook('schedule', s)
        await coreContainer.executeHooks('schedule', ['a', 'b'])
        expect(s.schedule).toHaveBeenNthCalledWith(1, 'a', 'b')
    })

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

    it('should return false because not swapping anything', () => {
        const swap = coreContainer.swap('singletonKeyWithInit', singletonWInit);
        expect(swap).toBe(false);
    })

    it('track order of init function calls', async () => {
        const calls: string[] = [];

        // Create singletons with mocked init functions
        const singletonWithInit1 = { value: 'abc', init: vi.fn(() => calls.push('singletonWithInit1')) };
        const singletonWithInit2 = { value: 'abc', init: vi.fn(async () => calls.push('singletonWithInit2')) };
        const singletonWithInit3 = { value: 'abc', init: vi.fn(() => calls.push('singletonWithInit3')) };
        const singletonWithInit4 = { value: 'abc', init: vi.fn(async () => calls.push('singletonWithInit4')) };

        // Add singletons to the container
        coreContainer.addSingleton('singletonKeyWithInit1', singletonWithInit1);
        coreContainer.addSingleton('singletonKeyWithInit2', singletonWithInit2);
        coreContainer.addSingleton('singletonKeyWithInit3', singletonWithInit3);
        coreContainer.addSingleton('singletonKeyWithInit4', singletonWithInit4);

        // Trigger the ready function
        await coreContainer.ready();

        // Verify the order of init function calls
        expect(calls).toEqual([
            'singletonWithInit1',
            'singletonWithInit2',
            'singletonWithInit3',
            'singletonWithInit4',
        ]);

        // Optionally, verify that each init function was called
        expect(singletonWithInit1.init).toHaveBeenCalled();
        expect(singletonWithInit2.init).toHaveBeenCalled();
        expect(singletonWithInit3.init).toHaveBeenCalled();
        expect(singletonWithInit4.init).toHaveBeenCalled();
    });
    

    it('should return true because not swapping anything', () => {
        coreContainer.addSingleton('singletonKeyWithInit', singletonWInit);
        const singletonWithInit2 = {
            value: 'singletonValueWithInit2',
            init: vi.fn()
        };
        const swap = coreContainer.swap('singletonKeyWithInit', singletonWithInit2);
        expect(swap).toBe(true);
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
        vi.spyOn(singletonWDispose, 'dispose')
        coreContainer.swap('singleton', singletonWithDispose2);

        expect(singletonWDispose.dispose).toHaveBeenCalledOnce();
        expect(coreContainer.get<Record<string, unknown>>('singleton')).toBe(singletonWithDispose2);
        expect(singletonWithDispose2.dispose).not.toHaveBeenCalledOnce();
        expect(singletonWithDispose3.dispose).not.toHaveBeenCalledOnce();
    })
    it('should swap object, maintaining reference to `this`', () => {
        coreContainer.addSingleton('singleton', singletonWDispose);
        const singletonWithDispose2 = {
            value: 'singletonValueWithDispose2',
            dispose: vi.fn()
        };
        const spiedDispose = vi.spyOn(singletonWDispose, 'dispose')
        const swapped = coreContainer.swap('singleton', singletonWithDispose2);
        expect(spiedDispose.mock.results[0].value).toEqual('singletonWithDispose');
        expect(coreContainer.get<Record<string, unknown>>('singleton')).toBe(singletonWithDispose2);
        expect(singletonWithDispose2.dispose).not.toHaveBeenCalledOnce();
    })
})
