const CACHE="dbjp-shell-v1";
const SHELL=["./","./index.html","./css/style.css","./css/print.css","./js/app.js","./manifest.json","./data/areas.json","./data/stops.json","./data/buses.json","./data/routes.json","./data/fares.json","./data/aliases.json","./data/emergency.json","./data/sources.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))))});
