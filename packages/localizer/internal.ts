
export interface Option {
    name:string,
    type: number,
    options?: Array<Option> 
}

export const applyLocalization  = 
    (item: Option, props: string[], basePath: string[], deps: any) => {
    for(const n of props) {
        const translated: string = deps.localizer.translationsFor(basePath.concat(n).join('.'))
        Reflect.set(item, n+'_localizations', translated) 
    }
}


export function dfsApplyLocalization(
    items: Array<Option>, 
    deps: Record<string,unknown>,
    path: string[]) {

  function dfs(item: Option, path: string[]) {
    const basePath = [...path, item.name]
    if (item.type === 1) {
        for (const subItem of item?.options??[]) {
            dfs(subItem, [...basePath, subItem.name]);
        }
    } else if (item.type === 2) {
        for (const subItem of item?.options??[]) {
            dfs(subItem, [...basePath, subItem.name]);
        }
    } else {
        //@ts-ignore
        if(Reflect.has(item, 'choices') && Array.isArray(item.choices)) {
            //@ts-ignore
            for(const choice of item.choices) {
                applyLocalization(choice, ['name'], [...basePath, 'choices'], deps)
            }
        }
    }
    applyLocalization(item, ['name', 'description'], basePath, deps)
  }

  for (const item of items) {
    dfs(item, [...path, 'options', item.name]);
  }
}


