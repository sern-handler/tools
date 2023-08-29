import type {
    AnySelectMenuInteraction,
    ButtonInteraction, ChannelSelectMenuInteraction, ClientEvents,
    MentionableSelectMenuInteraction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from 'discord.js'
import { Collection } from "discord.js";
import {
    distinctUntilKeyChanged,
    filter,
    MonoTypeOperatorFunction,
    Observable,
    OperatorFunction,
    pipe,
    reduce,
    take
} from "rxjs";
import type {Client} from "discord.js";
import {CustomId, on} from "../index.js";

/**
 * discord.js binding to ensure an event is {@link ButtonInteraction}
 * @param e
 */
export function isButton(e: unknown): e is ButtonInteraction  {
    return (e as ButtonInteraction)?.isButton?.() ?? false
}

export function matchesCustomId<T extends CustomId>(cmpt: string) : MonoTypeOperatorFunction<T> {
    return filter(i => i.customId == cmpt)
}

/**
 * discord.js binding to ensure an event is {@link AnySelectMenuInteraction}
 * Reminder that AnySelectMenuInteraction will be renamed to SelectMenuInteraction in the next major
 * @param e
 */
export function isSelectMenu(e: unknown): e is AnySelectMenuInteraction {
    return (e as AnySelectMenuInteraction)?.isAnySelectMenu?.() ?? false
}

export function isRoleSelectMenu(e: unknown): e is RoleSelectMenuInteraction {
    return (e as RoleSelectMenuInteraction)?.isRoleSelectMenu?.() ?? false
}

export function isStringSelectMenu(e: unknown): e is StringSelectMenuInteraction {
    return (e as StringSelectMenuInteraction)?.isStringSelectMenu?.() ?? false
}

export function isChannelSelectMenu(e: unknown): e is ChannelSelectMenuInteraction {
    return (e as ChannelSelectMenuInteraction)?.isChannelSelectMenu?.() ?? false
}

export function isUserSelectMenu(e: unknown): e is UserSelectMenuInteraction { 
    return (e as UserSelectMenuInteraction)?.isUserSelectMenu?.() ?? false;
}

export function isMentionableSelectMenu(e: unknown) : e is MentionableSelectMenuInteraction {
    return (e as MentionableSelectMenuInteraction)?.isMentionableSelectMenu?.() ?? false;
}

export function isModal(e: unknown) : e is ModalSubmitInteraction {
    return (e as ModalSubmitInteraction)?.isModalSubmit?.() ?? false;

}
/**
* emits source stream only if the custom id is unique
*/
export const distinctCustomId = <T extends { customId: string }> (src$: Observable<T>) => src$.pipe(distinctUntilKeyChanged('customId'));

//Collects all source emissions and emits them as a discord.js Collection when the source completes.
export function toCollection<Source, Key, Value>(
    transform: (src : Source) => [Key, Value],
    takeN?: number
): OperatorFunction<Source, Collection<Key,Value>> {
    return pipe(
        takeN ? take(takeN) : pipe(),
        reduce((coll, src) => {
            return coll.set(...transform(src)); 
        }, new Collection<Key, Value>())
    )
}


/**
 * Creates a typed client event observable
 * @param c
 * @param key
 */
export function clientEvent<T extends keyof ClientEvents>(c : Client, key : T) {
    return on(key, c) as Observable<ClientEvents[T]>
}
