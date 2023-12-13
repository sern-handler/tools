import poster from '../dist/index.js';
import type { GlobalGetAll, GlobalPut, TypedResponse } from '../dts/index.js';

const send = poster.client("token", "appid");


const req = await send("global/get-all", { 
    
}) as TypedResponse<GlobalPut>;

if(poster.isOk<GlobalPut>(req)) {
    
}
console.log(await req.json());

