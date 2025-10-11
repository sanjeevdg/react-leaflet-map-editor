import url from "@rollup/plugin-url";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    url({
      include: ["**/*.png", "**/*.svg", "**/*.jpg", "**/*.gif"],
      limit: 8192, // files <8kb become base64, others are copied
      emitFiles: true,
      fileName: "[dirname][hash][extname]",
    }),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "tsconfig.json",useTsconfigDeclarationDir: true,clean: true,
    }),
    postcss({
      extract: true,
    }),
  ],
  external: ["react", "react-dom", "leaflet", "leaflet-draw"],
};

