(ns core.poster
  (:use [core.actions :only [validators]]))

(def base-url (new js/URL "https://discord.com/api/v10/applications/"))

(def excluded-keys #js { "command" "absPath" })

(defn make-global [appid token] 
  "makes a url which posts to global"
  (new js/URL (str appid "/commands") base-url))

(defn poster [token, appid]
  (let [header #js{ "Content-Type" "application/json"
                    "Authorization" (str "Bot " token) }]
    (fn [action body]
      (let [ [request-init validator]  (validators action)
             { is-valid? :valid explain :explain } validator]
        (if (is-valid? body)
          (js/fetch base-url (request-init body))
          (explain body))))))
