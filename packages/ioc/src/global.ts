import assert from 'assert';
import { CoreContainer } from './container';

//SIDE EFFECT: GLOBAL DI
let containerSubject: CoreContainer;

/**
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
  * Don't use this unless you know what you're doing. Destroys old containerSubject if it exists and disposes everything
  * then it will swap
  */
export function __add_container(key: string, v: object) {
    containerSubject.addSingleton(key, v);
}

/**
  * Initiates the global api.
  * Once this is finished, the Service api and the other global api is available
  */
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

/**
 * The Service api, retrieve from the globally init'ed container
 * Note: this method only works AFTER your container has been initiated
 * @since 3.0.0
 * @example
 * ```ts
 * const client = Service('@sern/client');
 * ```
 * @param key a key that corresponds to a dependency registered.
 *
 */
export function Service<const T>(key: PropertyKey) {
    const dep = useContainerRaw().get<T>(key)!;
    assert(dep, "Requested key " + String(key) + " returned undefined");
    return dep;
}
/**
 * @since 3.0.0
 * The plural version of {@link Service}
 * @returns array of dependencies, in the same order of keys provided
 */
export function Services<const T extends string[], V>(...keys: [...T]) {
    const container = useContainerRaw();
    return keys.map(k => container.get(k)!) as V;
}
