import { type Init, Service, CommandInitPlugin, CommandType, controller } from '@sern/handler'
import { Localization as LocalsProvider } from 'shrimple-locales'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path';
import assert from 'node:assert';
import { applyLocalization, dfsApplyLocalization } from './internal'

/**
 * @since 3.4.0
 * @internal
 */
class ShrimpleLocalizer implements Init {
    private __localization!: LocalsProvider;
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
        const localPath = resolve('assets', 'locals');
        console.log(localPath)
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
  * assert.deepEqual(locals("salute.hello", "es"), "hola")
  * ```
  */
export const local  = (i: string, local: string) => {
    return Service('localizer').translate(i, local)
}


/**
  * An init plugin to add localization fields to a command module.
  * Your localization configuration should look like,
  * Below is es.json (spanish)
  * {
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
  */
export const localize = (root?: string) =>
    //@ts-ignore
    CommandInitPlugin(({ updateModule, module, deps }) => {
        if(module.type === CommandType.Slash || module.type === CommandType.Both) {
            const resolvedLocalization= 'command/'+root??module.name;
            applyLocalization(module, [resolvedLocalization, resolvedLocalization+'.description'], [], deps)
            const newOpts = module.options ?? [];
            //@ts-ignore 
            dfsApplyLocalization(newOpts, deps, [resolvedLocalization]);
            updateModule({ 
                options: newOpts
            });
            return controller.next();
        } else {
            console.error("Cannot localize this type of module");
            return controller.stop();
        }
})

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
        localizer.currentLocale = defaultLocale;
    }
    return localizer; 
}
