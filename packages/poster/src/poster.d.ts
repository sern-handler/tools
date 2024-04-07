declare module 'poster';

import type { paths } from './discord.d.ts'

export type GlobalGetAll = paths["/applications/{application_id}/commands"]["get"]
export type GlobalGet = paths["/applications/{application_id}/commands/{command_id}"]["get"]
export  type GlobalPost = paths["/applications/{application_id}/commands"]["post"]
export type GlobalEdit = paths["/applications/{application_id}/commands/{command_id}"]["patch"]
export type GlobalPut = paths["/applications/{application_id}/commands"]['put']
export type GlobalDelete = paths["/applications/{application_id}/commands/{command_id}"]["delete"]
export type GuildPost = paths["/applications/{application_id}/guilds/{guild_id}/commands"]["post"]
export type GuildGet = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["get"]
export type GuildEdit = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["patch"]
export type GuildDelete = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["delete"]
export type GuildPut = paths["/applications/{application_id}/guilds/{guild_id}/commands"]["put"]
export type ApplicationMe = paths["/applications/@me"]['get']

type ResponsesForRoute<T> = T extends { responses: infer R } ? R : never;


type GetOk <T,  V = Omit<T, '4XX'>> 
//@ts-ignore typescript shush
= V[keyof V]['content']['application/json']

//@ts-ignore shh
type GetErr<T> = T['4XX']

type ResultJson<T> = 
    | (GetOk<ResponsesForRoute<T>>)
    | (GetErr<ResponsesForRoute<T>>)


interface TypedResponse<T> extends Response {
    json(): Promise<ResultJson<T>>
}

interface RoutesOptions {
  "global/get-all": [{ query?: GlobalGetAll['parameters']['query'] }];
  "global/get":  [GlobalGet["parameters"]["path"] & { application_id?: never }];
  "global/post": [{ body: GlobalPost["requestBody"]["content"]['application/json'] } 
                  & GlobalPost["parameters"]["path"] 
                  & { application_id?: never }];
  "global/edit": [{ body: GlobalEdit["requestBody"]["content"]['application/json']} 
                  & GlobalEdit["parameters"]["path"] 
                  & { application_id?: never }];
  "global/put":  [{ body: GlobalPut["requestBody"]["content"]['application/json']} 
                  & GlobalPut["parameters"]['path'] 
                  & { application_id?: never } ];
  "global/delete": [];
  "guild/post": [{ body: GuildPost["requestBody"]["content"]['application/json'] }];
  "guild/get": [GuildGet["parameters"]["path"] 
                & { application_id?: never }];
  "guild/edit": [{ body: GuildEdit["requestBody"]["content"]['application/json'] } 
                  & GuildEdit["parameters"]["path"] 
                  & { application_id?: never }];
  "guild/delete": [GuildDelete["parameters"]["path"] & { application_id?: never }];
  "guild/put": [{ body: GuildPut["requestBody"]["content"]['application/json']} 
                  & GuildPut["parameters"]["path"] 
                  & { application_id?: never }];
  "application/me": []
}


interface Send {
    <T extends keyof RoutesOptions>
    (command : T, ...opts: RoutesOptions[T]): Promise<Response>
}

export function client(token: string): Promise<Send>;

export function isOk<T>(res : TypedResponse<T>) 
//WE CANNOT JUST INTERSECTION. We have to remove the old type for Json
: res is Omit<TypedResponse<T>, 'json'> & { json(): Promise<GetOk<ResponsesForRoute<T>>> }
export function is4XX<T>(res: TypedResponse<T>) 
//WE CANNOT JUST INTERSECTION. We have to remove the old type for Json
: res is Omit<TypedResponse<T>, 'json'> & { json(): Promise<GetErr<ResponsesForRoute<T>>> }

export { TypedResponse };

