(ns dev.mv)

(defn hook 
  {:shadow.build/stage :compile-finish}
  [build-state & args]
  (do (spit "./dist/discord.d.ts" (slurp "./dts/discord.d.ts"))
      (spit "./dist/index.d.ts" (slurp "./dts/index.d.ts")))
  build-state)
