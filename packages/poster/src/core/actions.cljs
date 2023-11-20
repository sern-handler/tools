(ns core.actions)


(def routes {
;       :global/get-all "/applications/{application.id}/commands"
;       :global/get    "/applications/{application.id}/commands/commands/{command.id}"
;       :global/post   "/applications/{application.id}/commands"
;       :global/edit   "/applications/{application.id}/commands/{command.id}"
        :global/delete ["DELETE", "/applications/{application.id}/commands/{command.id}"]
        :global/put    ["PUT" "/applications/{application.id}/commands"]
;       :guild/get-all  "/applications/{application.id}/guilds/{guild.id}/commands"
;       :guild/post    "/applications/{application.id}/guilds/{guild.id}/commands"
;       :guild/get     "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;       :guild/edit    "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;       :guild/delete  "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;       :guild/put     "/applications/{application.id}/guilds/{guild.id}/commands"
})

(defn request-init [spec]  
  (let [[method url] (routes spec)]
        [ url (fn [body headers] 
                #js { "method" method 
                      "headers" headers
                      "body" (.stringify js/JSON body )}) 
         ]))

(defn keyword->str [ky] 
  (subs (str ky) 1))

(def actions (into {} 
    (for [[k v] routes] [(keyword->str k)  (request-init k)])))



