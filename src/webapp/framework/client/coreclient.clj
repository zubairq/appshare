(ns webapp.framework.client.coreclient
  [:use [webapp.framework.server.encrypt]]
  (:use clojure.pprint)
  (:use webapp-config.settings)
  (:require [rewrite-clj.parser :as p])
  (:require [rewrite-clj.printer :as prn]))


(defmacro log [& x]
  `(.log js/console (str
                     ~@ x
                     ))
)



(defmacro on-click [el & code]

    `(webapp.framework.client.coreclient/on-click-fn
             ~el
             (fn [] (do ~@ code))
    )
  )

(defmacro on-mouseover [el & code]

    `(webapp.framework.client.coreclient/on-mouseover-fn
             ~el
             (fn [] (do ~@code))
    )
  )


(comment macroexpand '(define-action
                   "clear main page2"
                   (clear "main")
))

(defmacro sql [sql-str params]
  `(webapp.framework.client.coreclient.sql-fn
       ~(encrypt sql-str)
       ~params
   )
)


;( macroexpand '(sql "SELECT * FROM test_table where name = ?" ["shopping"] ))




(defn- xml-str
 "Like clojure.core/str but escapes < > and &."
 [x]
  (-> x str (.replace "&" "&amp;") (.replace "<" "&lt;") (.replace ">" "&gt;")))



;(defn ns-coils-debug [] "ZZZ")

(defmacro defn-html [fname args & code]
  `(do
        (defn ~fname
              [~@args]

             (webapp.framework.client.coreclient/debug ~@code ~(str `~fname))
        )

        (webapp.framework.client.coreclient/makeit2
             (~'ns-coils-debug)
             ~(str `~fname) ~(str `~args)

          (str ~(with-out-str   (write (first `~code))
                                        :dispatch clojure.pprint/code-dispatch))
        )



   )
)

(macroexpand
 '(defn-html
    forgot-password-button-html
      [& {:keys [do-after-click]}]
        do-after-click))

(defmacro ns-coils [namespace-name]
  `(defn ~'ns-coils-debug  [] (str ~namespace-name))
)


;(macroexpand '(ns-coils dfd))



(defmacro defn-ui-component [fn-name data-paramater-name opts & code ]

    `(do
       (defn ~fn-name [~(first data-paramater-name)  ~'owner]
         (~'reify

          ~'om/IInitState
          (~'init-state [_]
                      {})


           ~'om/IRender
           (~'render
            [~'this]

             ~(if *show-code*
               `(webapp.framework.client.coreclient/debug-react
                 ~(first data-paramater-name)
                 (~'fn [~(first data-paramater-name)]
                 ~@code))
                (first code))
         )))

       (~'webapp.framework.client.coreclient/process-ui-component  ~opts)

       ))


(    macroexpand
  '(defn-ui-component abc [data] {:path [:ui :request] }
     (dom/div
      nil
      (dom/div nil (str " You asdsddsads" data))
      )))



