(ns core.actions
  (:require [cljs.spec.alpha :as s]))

(defn create-validator [schema] 
  { :valid #(s/valid? schema %) 
    :explain #(s/explain schema %) })

#_(s/def ::http-verb (s/enum "POST" "PATCH" "PUT" "GET"))

(s/def :global/put some?)

(def routes {
;                 :GlobalGetAll "/applications/{application.id}/commands"
;                 :GlobalGet    "/applications/{application.id}/commands/commands/{command.id}"
;                 :GlobalPost   "/applications/{application.id}/commands"
;                 :GlobalEdit   "/applications/{application.id}/commands/{command.id}"
;                 :GlobalDelete "/applications/{application.id}/commands/{command.id}"
                  :global/put   #js["GET" "/applications/{application.id}/commands"]
;                 :GuildGetAll  "/applications/{application.id}/guilds/{guild.id}/commands"
;                 :GuildPost    "/applications/{application.id}/guilds/{guild.id}/commands"
;                 :GuildGet     "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;                 :GuildEdit    "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;                 :GuildDelete  "/applications/{application.id}/guilds/{guild.id}/commands/{command.id}"
;                 :GuildPut     "/applications/{application.id}/guilds/{guild.id}/commands"
            })
(defn parseurl 
  [appid] 

  
  )

(defn request-init [spec]  
  (fn [body] 
    #js { "method" (first (routes 'spec))
          "body" body }))

(def validators { 
  "global/put" [(request-init :global/put)
                (create-validator :global/put)]
})
