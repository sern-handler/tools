# Poster
REST API client for managing discord application commands.

## features

- Optionally typed responses
    - view an example (here)[../poster/test/spec.ts]
- Typed options
- Simple!
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
