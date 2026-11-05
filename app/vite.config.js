import { defineConfig } from 'vite';
export default defineConfig(({mode})=>({
  server: {host:'127.0.0.1',port:5174,strictPort:true,fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/.local/**','**/artifacts/**','**/docs/fuentes/**']},watch:{ignored:['**/.local/**','**/dist-demo/**','**/.prerender/**','**/tests/fixtures/**']},proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:false},'/publico':{target:'http://127.0.0.1:8787',changeOrigin:false}}},
  build:{manifest:true},
  define:{'import.meta.env.VITE_CATALOG_BACKEND':JSON.stringify(mode==='demo'?'demo':'local-api')}
}));
