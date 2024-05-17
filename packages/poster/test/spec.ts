import poster, { type GlobalPut } from '../dist/index.js';

const send = await poster.client("token");

const req = await send("user/get", { 
    user_id: ""
}); //cast for full typed safety

if(poster.isOk<GlobalPut>(req)) {
    req.json().then(s => s?.map(v => v.name))
    
}

const unhandled = await req.json();

unhandled // ??

