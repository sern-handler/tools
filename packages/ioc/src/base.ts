import * as assert from 'assert';
import { CoreContainer } from './container';

//SIDE EFFECT: GLOBAL DI
let containerSubject: CoreContainer;

/**
  * @internal
  * Don't use this unless you know what you're doing. Destroys old containerSubject if it exists and disposes everything
  * then it will swap
  */
export async function __swap_container(c: CoreContainer) {
    if(containerSubject) {
       await containerSubject.disposeAll() 
    }
    containerSubject = c;
}

/**
  * @internal
  * Don't use this unless you know what you're doing. Destroys old containerSubject if it exists and disposes everything
  * then it will swap
  */
export function __add_container(key: string, v: object) {
    containerSubject.addSingleton(key, v);
}

export function __init_container(options: {
    autowire: boolean;
    path?: string | undefined;
}) {
    containerSubject = new CoreContainer(options);
}
/**
 * Returns the underlying data structure holding all dependencies.
 * Exposes methods from iti
 * Use the Service API. The container should be readonly
 */
export function useContainerRaw() {
    assert.ok(
        containerSubject && containerSubject.isReady(),
        "Could not find container or container wasn't ready. Did you call makeDependencies?",
    );
    return containerSubject;
}


