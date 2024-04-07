import poster from '../dist/poster.js';

const send = await poster.client("");

const req = await send("global/get-all", { 
    
});


console.log(await req.json());

