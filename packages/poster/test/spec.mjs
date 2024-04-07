import poster from '../dist/core/poster.mjs';

const send = await poster.client("");

const req = await send("global/get-all", { 
    
});


console.log(await req.json());

