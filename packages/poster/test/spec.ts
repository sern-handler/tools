import poster, { type GlobalPut, type TypedResponse } from '../dist/poster.js';

const send = await poster.client("token");


const req = await send("global/get-all", { 
    
}) as TypedResponse<GlobalPut>; //cast for full typed safety

if(poster.isOk<GlobalPut>(req)) {
    req.json().then(s => s?.map(v => v.name))
    
}

const unhandled = await req.json();

unhandled // ??

