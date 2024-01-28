import poster from '../dist/index.js';
import type { GlobalGetAll, GlobalPut, TypedResponse } from '../dts/index.js';

const send = await poster.client("token");


const req = await send("global/get-all", { 
    
}) as TypedResponse<GlobalPut>; //cast for full typed safety

if(poster.isOk<GlobalPut>(req)) {
    req.json().then(s => s?.map(v => v.name))
    
}

const unhandled = await req.json();

unhandled // ??

