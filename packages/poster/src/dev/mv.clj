(ns dev.mv)
(require '[clojure.java.io :as io])
(defn hook 
  {:shadow.build/stage :compile-finish}
  [build-state & args]
  (do 
      (when (not (.exists (io/file "./dist"))) (.mkdir (io/file "./dist")))
      (spit "./dist/discord.d.ts" (slurp "./dts/discord.d.ts"))
      (spit "./dist/index.d.ts" (slurp "./dts/index.d.ts")))
  build-state)
