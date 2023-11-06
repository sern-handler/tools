(ns core.poster)

(def base-url (new js/URL "https://discord.com/api/v10/applications/"))

(def excluded-keys #{ "command" "absPath" })

(defn make-global [appid token] 
  "makes a url which posts to global"
  (new js/URL (str appid "/commands") base-url))

(defn poster [ appid token]
  (let [global-url (make-global appid token)] 
    #js {
      

    }))
