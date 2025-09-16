import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry:'src/index.js',
            name:'dom-renderer',
            formats:['es'],
            fileName: () => 'index.mjs'
        },
        outDir:'dist',
        emptyOutDir:true,
        minify:'terser',
        sourcemap:true,
    },
});
