import { type Init, Service } from '@sern/handler'
import { Localization as LocalsProvider } from 'shrimple-locales'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path';
import assert from 'node:assert';

/**
 * @since 3.4.0
 * @internal
 */
class ShrimpleLocalizer implements Init {
    private __localization!: LocalsProvider;
    constructor(){}
    currentLocale: string = "en-US";

    translationsFor(path: string): Record<string, any> {
        return this.__localization.localizationFor(path);
    }

    translate(text: string, local: string): string {
        this.__localization.changeLanguage(local);
        return this.__localization.get(text);
    }

    async init() {
        const map = await this.readLocalizationDirectory();
        this.__localization = new LocalsProvider({
            defaultLocale: this.currentLocale,
            fallbackLocale: "en-US",
            locales: map
        });
    }

    private async readLocalizationDirectory() {
        const translationFiles = [];
        const localPath = resolve('resources', 'locals');
        assert(existsSync(localPath), "No directory \"resources/locals\" found for the localizer")
        for(const json_path of await fs.readdir(localPath)) {
           const parsed = JSON.parse(await fs.readFile(join(localPath, json_path), 'utf8'))
           const name = json_path.substring(0, json_path.lastIndexOf('.'));
           translationFiles.push({ [name]: parsed })
        }
        return translationFiles.reduce((acc, cur ) => ({ ...cur, ...acc }),  {});
    }
}

/**
  * Translates a string to its respective local
  * Note: this method only works AFTER your container has been initiated
  * @example
  * ```ts
  * assert.deepEqual(locals("salute.hello", "es"), "hola")
  * ```
  */
export const local  = (i: string, local: string) => {
    return Service('localizer').translate(i, local)
}

/**
  * Returns a record of locales to their respective translations.
  * Note: this method only works AFTER your container has been initiated
  * @example
  * ```ts
  * assert.deepEqual(localsFor("salute.hello"), { "en-US": "hello", "es": "hola" })
  * ```
  */
export const localsFor = (path: string) => {
    return Service('localizer').translationsFor(path) 
}

/**
 * A service which provides simple file based localization. Add this while making dependencies.
 * @example 
 *  ```ts
 *  await makeDependencies(({ add }) => {
 *      add('@sern/localizer', Localization()); 
 *  });
 * ```
 **/
export const Localization = (defaultLocale?: string) => {
    const localizer = new ShrimpleLocalizer;
    if (defaultLocale) {
        localizer.currentLocale = defaultLocale;
    }
    return localizer; 
}
