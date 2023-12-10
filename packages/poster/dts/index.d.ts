declare module 'index.js';

import type { paths } from './discord.d.ts'

type Method = "get" | "post" | "patch" | "put" | "delete"

type GlobalGetAll = paths["/applications/{application_id}/commands"]["get"]
type GlobalGet = paths["/applications/{application_id}/commands/{command_id}"]["get"]
type GlobalPost = paths["/applications/{application_id}/commands"]["post"]
type GlobalEdit = paths["/applications/{application_id}/commands/{command_id}"]["patch"]
type GlobalPut = paths["/applications/{application_id}/commands"]['put']
type GlobalDelete = paths["/applications/{application_id}/commands/{command_id}"]["delete"]
type GuildPost = paths["/applications/{application_id}/guilds/{guild_id}/commands"]["post"]
type GuildGet = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["get"]
type GuildEdit = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["patch"]
type GuildDelete = paths["/applications/{application_id}/guilds/{guild_id}/commands/{command_id}"]["delete"]
type GuildPut = paths["/applications/{application_id}/guilds/{guild_id}/commands"]["put"]

interface RoutesOptions {
  "global/get-all": [];
  "global/get": [GlobalGet["parameters"]["path"] & { application_id?: never }];
  "global/post": [{ body: GlobalPost["requestBody"]["content"]['application/json'] } 
                  & GlobalPost["parameters"]["path"] 
                  & { application_id?: never }];
  "global/edit": [{ body: GlobalEdit["requestBody"]["content"]['application/json']} 
                  & GlobalEdit["parameters"]["path"] 
                  & { application_id?: never }];
  "global/put": [{ body: GlobalPut["requestBody"]["content"]['application/json']} 
                  & GlobalPut["parameters"]['path'] 
                  & { application_id?: never } ];
  "global/delete": [];
  "guild/post": [{ body: GuildPost["requestBody"]["content"]['application/json'] }];
  "guild/get": [GuildGet["parameters"]["path"] & { application_id?: never }];
      
  "guild/edit": [{ body: GuildEdit["requestBody"]["content"]['application/json'] } 
                  & GuildEdit["parameters"]["path"] 
                  & { application_id?: never }];
  "guild/delete": [GuildDelete["parameters"]["path"] & { application_id?: never }];
  "guild/put": [{ body: GuildPut["requestBody"]["content"]['application/json']} 
                  & GuildPut["parameters"]["path"] 
                  & { application_id?: never }];

}



interface Send {
    <T extends keyof RoutesOptions>(command : T, ...opts: RoutesOptions[T]): Promise<Response>
}

export default function (token: string, appid: string): Send;
