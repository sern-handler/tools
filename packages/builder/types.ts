import { APIApplicationCommandOptionBase, ApplicationCommandOptionType } from "discord-api-types/v10";


export const NoValidator = {};

export type Brand<K, T> = K & { __brand: T }
export type Name = Brand<string, 'Must be name'>
export type Description<_ extends ApplicationCommandOptionType> = Brand<string, 'Must be description'>


export type BaseOption<T extends ApplicationCommandOptionType> = APIApplicationCommandOptionBase<T> & {
    autocomplete?: boolean;
    required?: boolean;
    nsfw?: boolean 
}
export type BranchableTypes = ApplicationCommandOptionType.SubcommandGroup|ApplicationCommandOptionType.Subcommand;
/*
 * For either Subcommand or SubcommandGroup types. These are the only nodes that cannot be leaf nodes of 
 * options tree
 */
export type BranchNode<T extends BranchableTypes> = APIApplicationCommandOptionBase<T> & {
    autocomplete?: never;
    required?: never;
}
interface OptionTypeToPrimitive {
    [ApplicationCommandOptionType.Number]: number;
    [ApplicationCommandOptionType.String]: string;
    [ApplicationCommandOptionType.Integer]: number;
}
export type Choiceable = 
    | ApplicationCommandOptionType.String  
    | ApplicationCommandOptionType.Number 
    | ApplicationCommandOptionType.Integer;


export interface Choice<T extends Choiceable> {
    name: string,
    value: OptionTypeToPrimitive[T] 
}

export interface Validators {
    [ApplicationCommandOptionType.Number]: { min_value?: number; max_value?: number }
    [ApplicationCommandOptionType.Integer]: { min_value?: number; max_value?: number }
    [ApplicationCommandOptionType.String]: { max_length?: number; min_length?: number },
}

