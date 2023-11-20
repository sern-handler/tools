declare module 'index.js';


interface Routes {
     "global/put":  {
            body: {
                id?: string;
                name: string;
                name_localizations?: Record<string, unknown> 
                description: string; 
                description_localizations?: Record<string, unknown> 
                /**
                  *  type of command, default = 1
                  */
                type?: number;
                nsfw?: boolean;
                default_permission?:boolean
                /**
                  * @deprecated
                 */
                default_member_permissions?: string;
                options?: Record<string,unknown>[]
            }
     }
};
     
    
interface Send {
    <T extends keyof Routes>(command : T, opts: Routes[T]): Promise<Response>
};

export default function (token: string, appid: string): Send;
