'use strict';
const CACHE='moarok-shell-v4-sync';
const ASSETS=['/','/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-maskable-512.png','/apple-touch-icon.png'];
const ALLOWED=new Set(ASSETS);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('moarok-shell-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})())});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{const request=event.request;const url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||!ALLOWED.has(url.pathname))return;
// No user data, form values, records, or JSON backups ever enter this cache.
if(request.mode==='navigate'){event.respondWith((async()=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),4500);try{const response=await fetch('/',{cache:'no-store',signal:controller.signal});if(response.ok)return response;throw Error('App unavailable')}catch(e){const cache=await caches.open(CACHE);return await cache.match('/')||Response.error()}finally{clearTimeout(timeout)}})())}else{event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(url.pathname);return saved||fetch(request)})())}});
