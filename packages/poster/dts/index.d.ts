declare module 'index.js';

interface Routes {
     "global/put":  {
            type?: number|undefined;
            name: string;
            description: string;
     }
};
     
    
interface Send {
    <T extends keyof Routes>(command : T, opts: Routes[T]): Promise<Response>
};

export default function (token: string, appid: string): Send;
