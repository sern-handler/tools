import poster from '../dist/index.js';

const send = poster.client("token", "appid");


const req = await send("global/get-all", { 
    
});


console.log(await req.json());

