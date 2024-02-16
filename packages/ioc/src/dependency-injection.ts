import assert from 'node:assert';
import { useContainerRaw } from './base';


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
