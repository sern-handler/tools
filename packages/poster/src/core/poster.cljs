(ns core.poster
  (:require  [clojure.string :refer [replace]]
             [shadow.cljs.modern :refer (js-await)]
             [core.actions :refer [actions]]))

(def base "https://discord.com/api/v10")

(defn- inject [remaining-url opts] 
  (-> (str base remaining-url)
      (replace #"\{application\.id\}" (.-app_id ^js opts))
      (replace #"\{guild\.id\}" (.-guild_id ^js opts))
      (replace #"\{command\.id\}" (.-command_id ^js opts))))

(defn- ?params [^js query]
  (new js/URLSearchParams query))


(defn fetch-application [headers] 
  #_(println (str base (actions "application/me")))
  (-> (js/fetch (str base (first (actions "application/me"))) #js{ "headers" headers })
                   (.then (fn [res] (.json res))) 
                   (.then (fn [json] (.-id json)))))
(defn poster [token, appid]
  (let [header #js{ "Content-Type" "application/json"
                    "Authorization" (str "Bot " token) } ]
    (js-await [appid (fetch-application header)]
     (fn [action opts]
      (let [[url mkrequest]  (actions action)
            options #js{"app_id" appid 
                        "guild_id" (.-guild_id ^js opts) 
                        "command_id" (.-command_id ^js opts)}
            url (new js/URL (inject url options))]
        (set! (.-search url) (?params (.-query ^js opts))) 
        (js/fetch url (mkrequest (.-body ^js opts) header)))))))

(defn isOk? [^js response] 
  (.-ok response))

(defn is4XX? [^js response] 
  (not (.-ok response)))
  
