# Poster
REST API client for managing discord application commands.

## features

- Optionally typed responses
    - view an example (here)[../poster/test/spec.ts]
- Typed options
- Simple! (sort of)
- ClojureScript + Typescript
    - I'm sorry.

## usage 
```ts
import poster from '@sern/poster';

const send = poster.client("token", "appid");

const req = await send("global/get-all", { 
    
});

console.log(await req.json());
```

## Mappings
This package is pretty simple. Create a new client and call one of the "endpoints" 


| Endpoint         | Method | Path                                                |
|------------------|--------|---------------------------------------------------- |
| global/get-all   | GET    | /applications/{application.id}/commands             |
| global/get       | GET    | /applications/{application.id}/commands/{command.id}|
| global/post      | POST   | /applications/{application.id}/commands             |
| global/edit      | PATCH  | /applications/{application.id}/commands/{command.id}|
| global/delete    | DELETE | /applications/{application.id}/commands/{command.id}|
| global/put       | PUT    | /applications/{application.id}/commands             |
| guild/get-all    | GET    | /applications/{application.id}/guilds/{guild.id}/commands|
| guild/post       | POST   | /applications/{application.id}/guilds/{guild.id}/commands|
| guild/get        | GET    | /applications/{application.id}/guilds/{guild.id}/commands/{command.id}|
| guild/edit       | PATCH  | /applications/{application.id}/guilds/{guild.id}/commands/{command.id}|
| guild/delete     | DELETE | /applications/{application.id}/guilds/{guild.id}/commands/{command.id}|
| guild/put        | PUT    | /applications/{application.id}/guilds/{guild.id}/commands|

Documentation for these routes are specified in the discord api documentation, 
starting [here.](https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands)
