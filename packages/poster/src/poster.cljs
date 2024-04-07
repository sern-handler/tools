(ns poster
  (:require  [clojure.string :as s]
             [actions :refer [actions]]))

(def ^:private base "https://discord.com/api/v10")

(defn- inject [remaining-url opts] 
  (-> (str base remaining-url)
      (s/replace #"\{application\.id\}" (or (.-app_id ^js opts) ""))
      (s/replace #"\{guild\.id\}" (or (.-guild_id ^js opts) ""))
      (s/replace #"\{command\.id\}" (or (.-command_id ^js opts) ""))))

(defn- ?params [^js query]
  (new js/URLSearchParams query))


(defn- ^:async fetch-application [headers] 
  (js-await  (-> (js/fetch (str base (first (get actions "application/me"))) #js{ "headers" headers })
      (.then (fn ^:=> [res] (.json res))) 
      (.then (fn ^:=> [son] (if-let [id (.-id son)] 
                              id (throw (str "Reason " (.-message  son))))))
      (.catch (fn ^:=> [e] (throw e))))))

(defn- poster [token, appid]
  (let [header #js{ "Content-Type" "application/json"
                    "Authorization" (str "Bot " token) }]
     (^:async fn [action opts]
      (let [[url mkrequest]  (get actions action)
            appid (js-await (fetch-application header))
            options #js{"app_id" appid 
                        "guild_id" (.-guild_id ^js opts) 
                        "command_id" (.-command_id ^js opts)}
            url (new js/URL (inject url options)) ]
        (set! (.-search url) (?params (.-query ^js opts))) 
        (js/fetch url (mkrequest (.-body ^js opts) header))))))

(defn- isOk? [^js response] 
  (.-ok response))


(def default {
  :client poster             
  :isOk isOk?
  :is4XX (complement isOk?) 
})
