import poster from '../dist/index.js';

const send = await poster.client("MTA2MTQyMTgzNDM0MTQ2MjAzNg.GL15Ob.EJ9SgdMQUhTTTGRhRKNBvVDQkTma7AG3DuLWis");

const req = await send("global/get-all", { 
    
});


console.log(await req.json());

