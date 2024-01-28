import poster from '../dist/index.js';

const send = await poster.client("");

const req = await send("global/get-all", { 
    
});


console.log(await req.json());

