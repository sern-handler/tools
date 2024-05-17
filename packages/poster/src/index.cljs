(ns poster
  (:require  [clojure.string :as s]
             [actions :refer [actions]]))

(def ^:private base "https://discord.com/api/v10")

(defn- inject [remaining-url opts] 
  (-> (str base remaining-url)
      (s/replace #"\{application\.id\}" (or (.-app_id ^js opts) ""))
      (s/replace #"\{guild\.id\}" (or (.-guild_id ^js opts) ""))
      (s/replace #"\{user\.id\}" (or (.-guild_id ^js opts) ""))
      (s/replace #"\{command\.id\}" (or (.-command_id ^js opts) ""))))

(defn- ?params [^js query]
  (new js/URLSearchParams query))

(defn- fetch-application [headers] 
    (let [url (str base (first (get actions "application/me")))]
      (-> (js/fetch url #js{ "headers" headers })
          (.then (fn ^:=> [res] (.json res))) 
          (.then (fn ^:=> [son] (if-let [id (.-id son)] 
                                  id 
                                  (throw (str "Reason " (.-message  son))))))
          (.catch (fn ^:=> [e] (throw e))))))

(defn- poster [token]
  (let [header { "Content-Type" "application/json"
                 "Authorization" (str "Bot " token) }]
     (^:async fn [action opts]
      (let [[url mkrequest]  (get actions action)
            appid (js-await (fetch-application header))
            options {:app_id appid :guild_id (.-guild_id opts) :command_id (.-command_id opts)} 
            url (new js/URL (inject url options)) ]
        (set! (.-search url) (?params (.-query opts))) 
        (js/fetch url (mkrequest (.-body opts) header))))))

(defn- isOk? [response] 
  (.-ok response))


(def default { :client poster             
               :isOk isOk?
               :is4XX (complement isOk?) })
