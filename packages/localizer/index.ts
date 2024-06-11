import { type Init, Service, CommandInitPlugin, CommandType, controller } from '@sern/handler'
import { Localization as LocalsProvider } from 'shrimple-locales'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path';
import assert from 'node:assert';
import { dfsApplyLocalization } from './internal'


/**
 * @since 3.4.0
 * @internal
 */
class ShrimpleLocalizer implements Init {
    private __localization!: LocalsProvider;
    private currentLocale: string = "en";

    translationsFor(path: string): Record<string, any> {
        return this.__localization.localizationFor(path);
    }

    translate(text: string, local?: string): string {
        return this.__localization.get(text, local);
    }

    setCurrentLocale(local: string): void {
        this.__localization.changeLanguage(local);
    }

    async init() {
        const map = await this.readLocalizationDirectory();
        this.__localization = new LocalsProvider({
            defaultLocale: this.currentLocale,
            fallbackLocale: "en",
            locales: map
        });
    }

    private async readLocalizationDirectory() {
        const translationFiles = [];
        const localPath = resolve('assets', 'locals');
        assert(existsSync(localPath), "No directory \"assets/locals\" found for the localizer")
        for(const json_path of await fs.readdir(localPath)) {
           const parsed = JSON.parse(await fs.readFile(join(localPath, json_path), 'utf8'))
           const name = json_path.substring(0, json_path.lastIndexOf('.'));
           translationFiles.push({ [name]: parsed })
        }
        return translationFiles.reduce((acc, cur) => ({ ...cur, ...acc }),  {});
    }
}

/**
  * Translates a string to its respective local
  * Note: this method only works AFTER your container has been initiated
  * @example
  * ```ts
  * assert.deepEqual(locals("salute.hello", "es-ES"), "hola")
  * ```
  */
export const local = (i: string, local: string) => {
    return Service('localizer').translate(i, local)
}




/**
  * An init plugin to add localization fields to a command module.
  * Your localization configuration should look like,
  * @param root {string} If you have conflicting command names, you may configure the root of the name. (= command/{root})
  * Below is es-ES.json (spanish)
  * ```json
    {
        "command/comer" : {
            "description": "Comer en Texas",
            "options": {
                "chicken": {
                    "name": "pollo",
                    "description": "un pollo largo"
                }
            }
        }
    }
    ```
  */
export const localize = (root?: string) =>
    //@ts-ignore
    CommandInitPlugin(({ module, deps }) => {
        if(module.type === CommandType.Slash || module.type === CommandType.Both) {
            deps['@sern/logger'].info({ message: "Localizing "+ module.name });
            const resolvedLocalization= 'command/'+(root??module.name);
            Reflect.set(module, 'name_localizations', deps.localizer.translationsFor(resolvedLocalization+".name"));
            Reflect.set(module, 'description_localizations', deps.localizer.translationsFor(resolvedLocalization+'.description'));
            //@ts-ignore
            const newOpts = module.options ?? [];
            //@ts-ignore 
            dfsApplyLocalization(newOpts, deps, [resolvedLocalization]);
            return controller.next();
        } else {
            return controller.stop("Cannot localize this type of module " + module.name);
        }
})

export interface Localizer {
   /**
    * Returns an object containing translations for the given path.
    * The object keys are the translation keys, and the values are the translated strings.
    * 
    * @param path - The path to the translations file or directory.
    * @returns An object with translation keys and their corresponding translated strings.
    */
   translationsFor(path: string): Record<string, any>;

   /**
    * Translates the given text to the specified locale.
    *
    * @param text - The text to be translated.
    * @param locale - The locale to translate the text to.
    * @returns The translated text.
    */
   translate(text: string, locale?: string): string;

   /**
    * Sets the current locale to be used for translation.
    * @param locale - The locale to set as the current locale.
    */
   setCurrentLocale(locale: string): void;
}

/**
 * A service which provides simple file based localization. Add this while making dependencies.
 * @example 
 *  ```ts
 *  await makeDependencies(({ add }) => {
 *      add('localizer', Localization()); 
 *  });
 * ```
 **/
export const Localization = (defaultLocale?: string) => {
    const localizer = new ShrimpleLocalizer;
    if (defaultLocale) {
        localizer.setCurrentLocale(defaultLocale);
    }
    return localizer as Localizer;
}
