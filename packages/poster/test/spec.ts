import poster, { type GlobalPut, type TypedResponse } from '../dist/index.js';

const send = await poster.client("MTI0MTA4MzI5NDYzNzA5NzAyMQ.G8EKXD.q4s-pDrim6SnHcsPrFY3uQpn_8SCF8-vSPYZ48");


const req = await send("user/get", { 
    user_id: ""
}) as TypedResponse<GlobalPut>; //cast for full typed safety

if(poster.isOk<GlobalPut>(req)) {
    req.json().then(s => s?.map(v => v.name))
    
}

const unhandled = await req.json();

unhandled // ??

