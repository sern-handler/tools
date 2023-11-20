(ns core.poster
  (:require  [clojure.string :refer [replace]]
             [core.actions :refer [actions]]))

(def base-url "https://discord.com/api/v10/applications")

(defn processed-url [remaining-url opts] 
  (-> (str base-url remaining-url)
       (replace  #"\{application\.id\}" (.-app_id ^js opts))
       (replace  #"\{guild\.id\}" (.-guild_id ^js opts))
       (replace  #"\{command\.id\}" (.-command_id ^js opts))))

(defn poster [token, appid]
  (let [header #js{ "Content-Type" "application/json"
                    "Authorization" (str "Bot " token) }]
    (fn [action opts]
      (let [ [url mkrequest]  (actions action)
             full-url (processed-url url #js { "app_id" appid 
                                               "guild_id" (.-guild_id ^js opts) 
                                               "command_id" (.-command_id ^js opts) })] 
        (js/fetch  full-url (mkrequest (.-body ^js opts ) header))))))
