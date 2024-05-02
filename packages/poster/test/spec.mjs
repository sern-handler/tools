import poster from '../dist/poster.mjs';

const send = await poster.client("token");

const req = await send("global/get-all", { 
    
});


console.log(await req.json());

