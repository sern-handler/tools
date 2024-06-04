import { test, expect, describe, it, vi, afterEach } from 'vitest'
import { Localization } from '../index'
import { applyLocalization, dfsApplyLocalization, Option } from '../internal';

test('Localization Instance', () => {
    expect(Localization()).toBeTruthy()
})

describe('applyLocalization', () => {
  it('should apply localizations to the given item', () => {
    const item: Record<string,any> = {};
    const props = ['name', 'description'];
    const basePath = ['app', 'pages'];
    const localizer = {
      translationsFor: vi.fn((key: string) => `translated.${key}`),
    };
    const deps = { localizer };

    //@ts-ignore
    applyLocalization(item, props, basePath, deps);
    expect(item.name_localizations).toBe('translated.app.pages.name');
    expect(item.description_localizations).toBe('translated.app.pages.description');
  });

  it('should not modify the item if no props are provided', () => {
    //@ts-ignore
    const item: Option = {};
    const props: string[] = [];
    const basePath = ['app', 'pages'];
    const localizer = {
      translationsFor: vi.fn(),
    };
    const deps = { localizer };

    applyLocalization(item, props, basePath, deps);

    expect(item).toEqual({});
  });
});


describe('dfsApplyLocalization', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should apply localizations to top-level items', () => {
    const items = [{ type: 3,  name: 'item1' }, { type: 3, name: 'item2' }];
    const deps = { localizer: { translationsFor: vi.fn() } };
    const path = ['root'];

    dfsApplyLocalization(items, deps, path);
    
  });

  it('should apply localizations to nested items', () => {
    const items: Option[] = [
      {
        name: 'item1',
        type: 1,
        options: [{ type: 3, name: 'subItem1' }],
      },
    ];
    const deps = { localizer: { translationsFor: vi.fn() } };
    const path = ['root'];

    dfsApplyLocalization(items, deps, path);
    
  });

  it('should apply localizations to choices', () => {
    const items: Option[] = [
      {
        name: 'item1',
        //@ts-ignore
        choices: [{ name: 'choice1' }, { name: 'choice2' }],
      },
    ];
    const deps = { localizer: { translationsFor: vi.fn(() => "a") } };
    const path = ['root'];

    dfsApplyLocalization(items, deps, path);
    console.log(items[0].choices)
  });
  it('should call applyLocalization n times, n = num of options', () => {
    
    const items: Option[] = [
      {
        name: 'item1',
        type: 3,
      },
      {
        name: "item2",
        type: 4
      }
    ];
  })
});
