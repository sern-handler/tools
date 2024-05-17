import poster from '../dist/index.mjs';

const send = poster.client("token");

const req = await send("user/get", { 
    
});


console.log(await req.json());

