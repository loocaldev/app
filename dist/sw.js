if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,l)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let t={};const u=e=>i(e,r),o={module:{uri:r},exports:t,require:u};s[r]=Promise.all(n.map((e=>o[e]||u(e)))).then((e=>(l(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/auto-track-BaUAKTG6.js",revision:null},{url:"assets/index-BNIvijon.css",revision:null},{url:"assets/index-CCWgLxQS.js",revision:null},{url:"assets/index-COYpdRsC.js",revision:null},{url:"assets/index-D_GiK5yw.js",revision:null},{url:"assets/index-D6ZMQedT.js",revision:null},{url:"assets/index-DdyvxSe-.js",revision:null},{url:"assets/index-DPVt0Q3F.js",revision:null},{url:"assets/index-Mvtr88YV.js",revision:null},{url:"assets/index.es-Dx8eYsqG.js",revision:null},{url:"assets/index.umd-9qBwbFkf.js",revision:null},{url:"assets/is-plan-event-enabled-DS1Agtkw.js",revision:null},{url:"assets/purify.es-a-CayzAK.js",revision:null},{url:"index.html",revision:"16f7abe5b55f5965b1de08009e4cfc64"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"icon-192x192.png",revision:"5137d626c5715f125a51325423345f03"},{url:"icon-512x512.png",revision:"22ee49e221d4009cc68a827de2c91233"},{url:"manifest.webmanifest",revision:"f8176268e8b8465b29536726fd1386d8"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{denylist:[/^\/admin/,/^\/api/]}))}));
