import poster from '../dist/index.js';

const send = poster("token", "appid");


const req = await send("global/get-all");


console.log(req);

