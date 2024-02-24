
export function hasCallableMethod(obj: object, name: PropertyKey) {
    //@ts-ignore
    return Object.hasOwn(obj, name) && typeof obj[name] == 'function';
}
