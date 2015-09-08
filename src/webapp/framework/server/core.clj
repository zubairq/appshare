(ns webapp.framework.server.core
  [:require [webapp.server.fns]]
  [:use [webapp.framework.server.systemfns]]
  [:use [ring.middleware.format]]
  [:use [compojure.core]]
;  [:use [ring.middleware.json]]
  [:require [ring.middleware.multipart-params :as mp]]
  [:require [compojure.route :as route]]
  [:require [compojure.handler :as handler]]
  [:require [ring.util.response :as resp]]
  [:use [webapp-config.settings]]
  (:use [webapp.framework.server.email-service])
  (:require [clojure.java.io :as io])
  (:use [webapp.framework.server.globals])
)







(defn parse-params [params]
  (do
  ;(println (str "Action:" (:action params) (:systemaction params)
  ;              "  ,Count params:" (count (keys (load-string (:params params))))))
  (let
    [
     code (str
           "("
           (if (:action params) "webapp.server.fns/" "webapp.framework.server.systemfns/")
           (if (:action params) (:action params) (:systemaction params))
           " "

           (if (> (count (keys (load-string (:params params)))) 0) (str
                                            (:params params)))
           ")")
     ]
    ;(println ":" code)
    (pr-str (load-string code))
    )))






(defn upload-file
  [file]

  ;(println (str  file))

  (io/copy
   (file :tempfile)
   (io/file "../pictures/a.jpg"))

  "DONE")




(defroutes main-routes
  (POST "/:domain/action" {params :params}
    (parse-params  params))

  (POST "/action" {params :params}
    (parse-params  params))

   (mp/wrap-multipart-params
       (POST "/file" {params :params}
             (do

             (upload-file (get params "file")))))





  (GET "/" []
       (resp/resource-response (str *main-page*) {:root "public"}))



  (route/resources "/:domain/")
  (route/resources "/")



  (ANY "/*:name" [name]
       (.replaceFirst
        (slurp (:body
                (resp/resource-response (str *main-page*) {:root "public"})
                ))
       "addparam2" name))
;       (resp/resource-response (str *main-page* "?add=" name) {:root "public"}))
;       (resp/redirect (str *main-page* "?addparam=" name)))
)



(comment .replaceFirst
        (slurp (:body
                (resp/resource-response (str *main-page*) {:root "public"})
                ))
       "ConnectToUs" "xxx")

(comment :body (rest/GET

        (str (clojure.java.io/resource (str "public/" *main-page*)))

        ))


        (str (clojure.java.io/resource (str "public/" *main-page*)))


(defn wrap-dir-index [handler]
  (fn [req]
    (handler
     (update-in req [:uri]
                #(if (= "/" %) (str "/" *main-page*) %)))))





(def app
    (-> (handler/api main-routes)
        ;(wrap-json-params)
))






; deletes the realtime log every time the file is reloaded, or the server is restarted
(let [coils-admin-tables      (korma.core/exec-raw
                                   [" select * from pg_tables where schemaname='public' and tablename='coils_realtime_log'" []]
                                   :results)

        coils-admin-table-exists   (pos? (count coils-admin-tables))
      ]
  (if coils-admin-table-exists
    (korma.core/exec-raw ["delete from coils_realtime_log" []] [])))



