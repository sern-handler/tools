import * as assert from 'node:assert';
import { BaseOption, BranchNode, Choice, Choiceable, Description, Name, NoValidator, Validators } from './types';
import { ApplicationCommandOptionType, ChannelType, LocalizationMap } from 'discord-api-types/v10'

/*
 * placeholder type for ranges
 * @example 
 * ```ts 
 * str(
 *   name('example'),
 *   description('example'),
 *   length(_, 10), //no min, max length of 10
 *   Flags.Required
 * )
 *
 * ```
 */
export const _ = NaN;
export enum Flags {
    None = 0,
    Required = 1 << 0,
    Autocomplete = 1 << 1,
    Nsfw = 1 << 2
}
function mapFlags(flags: Flags): Record<string,unknown> {
    const output: Record<string,unknown> = {};

    if (flags & Flags.Required) {
        output.required = true;
    }

    if (flags & Flags.Autocomplete) {
        output.autocomplete = true;
    }

    if (flags & Flags.Nsfw) {
        output.nsfw = true;
    }

    return output;
}

/**
  * Function to provide localization options to options
  */
export function local<T extends ApplicationCommandOptionType>(
    b: BaseOption<T>,
    options : { name_localizations?: LocalizationMap|null; description_localizations?: LocalizationMap|null }
) {
    return {
        ...b,
        ...options
    }
}

/**
  * declare range for number option
  */
export function range<T extends 
    ApplicationCommandOptionType.Number 
    | ApplicationCommandOptionType.Integer
>(min?: number, max?: number): Validators[T] {
    return { 
        min_value: Number.isNaN(min) ? undefined : min,
        max_value: Number.isNaN(max) ? undefined : max
    } as Validators[T];
}

export function length<T extends ApplicationCommandOptionType.String>(min?: number, max?: number): Validators[T] {
    const base = { 
        min_length: Number.isNaN(min) ? undefined : min,
        max_length: Number.isNaN(max) ? undefined : max
    } as Validators[T];

    if(typeof base.min_length === 'number') {
        assert.ok(6000 >= base.min_length  && base.min_length >= 0, "Invalid range: min length should be 0 <= x <= 6000" )
    }
    if(typeof base.max_length === 'number') {
        assert.ok(6000 >= base.max_length  && base.max_length >= 1, "Invalid range: min length should be 1 <= x <= 6000" )
    }
    return base;
}

function baseOption<T extends ApplicationCommandOptionType>(
    type: T,
    name: string,
    description: string,
    flags: Flags,
    other: Record<string, unknown> = {}
): BaseOption<T> {
    return {
        type,
        name,
        description,
        ...mapFlags(flags),
        ...other 
    }; 
}
/**
  * For choices that have the same name and value
  */
export function identity(value: string) {
    return { name: value, value }
}

/**
  * Represents any option that is a choice
  * ie: String, Number, or Integer option
  */
export function choice<T extends Choiceable>( 
   choiceable: BaseOption<T>,
   choices: Choice<T>[]
) {
    assert.ok(!choiceable.autocomplete, "Cannot have autocomplete set to true with choices enabled");
    //@ts-ignore
    choiceable.choices = choices;
    return choiceable as BaseOption<T> & { choices: Choice<T>[] };
}

/**
  * Represents a string option
  */
export function str<T extends ApplicationCommandOptionType.String>(
    name: Name, description: Description<T>,
    validators: Validators[T] = NoValidator,
    flags: Flags = Flags.None,
) {
    return baseOption(ApplicationCommandOptionType.String, name, description, flags, validators);
}

/**
  * Represents a number option
  */
export function num<T extends ApplicationCommandOptionType.Number>(
    name: Name,
    description: Description<T>,
    validators: Validators[T] = NoValidator,
    flags: Flags = Flags.None,
) {
    return baseOption(
        ApplicationCommandOptionType.Number,
        name,
        description,
        flags,
        validators
    );
}
/**
  * Represents a attachment option
  */
export function attachment(
    name: Name,
    description: Description<ApplicationCommandOptionType.Attachment>,
    flags: Flags= Flags.None
)
 {
    return baseOption(
        ApplicationCommandOptionType.Attachment,
        name,
        description,
        flags
    )
}

/**
  * Represents a integer option
  */
export function int(
    name: Name,
    description: Description<ApplicationCommandOptionType.Integer>,
    validators: Validators[ApplicationCommandOptionType.Integer] = NoValidator,
    flags: Flags= Flags.None

) {
    return baseOption(
        ApplicationCommandOptionType.Integer,
        name,
        description,
        flags,
        validators
    );
}
/**
  * Represents a user option
  */
export function user(
    name: Name,
    description: Description<ApplicationCommandOptionType.User>,
    flags: Flags= Flags.None

) {
    return baseOption(
        ApplicationCommandOptionType.User,
        name,
        description,
        flags
    );
}
/**
  * Represents a channel option
  */
export function channel(
    name: Name,
    description: Description<ApplicationCommandOptionType.Channel>,
    channel_types: ChannelType[] = [],
    flags: Flags= Flags.None

) {
    return baseOption(
        ApplicationCommandOptionType.Channel,
        name,
        description,
        flags,
        { channel_types }
    );
}
/**
  * Represents a mentionable option
  */
export function mentionable(
    name: Name,
    description: Description<ApplicationCommandOptionType.Mentionable>,
    flags: Flags= Flags.None

) {
    return baseOption(
        ApplicationCommandOptionType.Mentionable,
        name,
        description,
        flags
    );
}
/*
 * wrapper function validating a string by Discord command / option name regex,
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming
 */
export function name(v: string): Name {
    //idk if unicode flag is set yet!
    assert.match(v, /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/gu, v + " does not match a valid command name")
    return v as Name;
}

/*
 * wrapper function validating a string description,
 * the length must be 0 <= x <= 100
 */
export function description<T extends ApplicationCommandOptionType>(args: string) {
    assert.ok(0 <= args.length && args.length <= 100) 
    return args as unknown as Description<T>;
}

export function subcommand(
    name: Name,
    description: Description<ApplicationCommandOptionType.Subcommand>,
    options: BaseOption<ApplicationCommandOptionType>[] = [],
    flags: Flags = Flags.None
) {
   assert.ok(!(flags & (Flags.Autocomplete | Flags.Required)), "Cannot have autocomplete or required flag on subcommand");
   return baseOption(
        ApplicationCommandOptionType.Subcommand,
        name,
        description,
        flags,
        { options }
    ) as BranchNode<ApplicationCommandOptionType.Subcommand>
}

export function subcommandgroup(
    name: Name,
    description: Description<ApplicationCommandOptionType.Subcommand>,
    options: BaseOption<ApplicationCommandOptionType.Subcommand>[],
    flags: Flags = Flags.None
) {
    assert.ok(!(flags & (Flags.Autocomplete | Flags.Required)), "Cannot have autocomplete or required flag on subcommandgroup");
    assert.ok(options.every(t => t.type === ApplicationCommandOptionType.Subcommand))
    return baseOption(
        ApplicationCommandOptionType.SubcommandGroup,
        name,
        description,
        flags,
        { options }
    ) as BranchNode<ApplicationCommandOptionType.SubcommandGroup>;
}
/* 
 * For sern/handler usage only- sern/handler handles autocomplete in options structures
 * For pure Discord API, enable the Autocomplete flag on the option
 */
export function autocomplete<T>(b: BaseOption<ApplicationCommandOptionType>, cb: (args: T) => PromiseLike<unknown> | unknown ) {
    if(!b.autocomplete) {
       b.autocomplete = true    
    }
    return {
        ...b,
        command: {
            onEvent: [],
            execute: cb
        }
    }
}

export { Choice, NoValidator, BaseOption };
