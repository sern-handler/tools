(ns core.actions)


(def routes {
       :global/get-all ["GET" "/applications/{application.id}/commands"]
       :global/get     ["GET" "/applications/{application.id}/commands/{command.id}"]
       :global/post    ["POST" "/applications/{application.id}/commands"]
       :global/edit    ["PATCH" "/applications/{application.id}/commands/{command.id}"]
       :global/delete  ["DELETE", "/applications/{application.id}/commands/{command.id}"]
       :global/put     ["PUT" "/applications/{application.id}/commands"]
       :guild/get-all  ["GET" "/applications/{application.id}/guilds/{guild.id}/commands"]
       :guild/post     ["POST" "/applications/{application.id}/guilds/{guild.id}/commands"]
       :guild/get      ["GET" "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
       :guild/edit     ["PATCH" "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
       :guild/delete   ["DELETE" "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"]
       :guild/put      ["PUT" "/applications/{application.id}/guilds/{guild.id}/commands"]
       :application/me ["GET"  "/applications/@me"]
})

(defn- request-init [v]  
  (let [[method url] v]
        [url (fn [body headers] 
                #js { "method" method 
                      "headers" headers
                      "body" (.stringify js/JSON body )}) 
         ]))


(def actions (into {} 
    (map (fn [[k v]] [k  (request-init v)]))
    routes))



