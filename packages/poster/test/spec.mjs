import poster from '../dist/index.js';

const client = poster("token", "appid");


const req = await client("global/put", {  });


console.log(req);

