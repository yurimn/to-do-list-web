'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "b8ca934dbba9cfc0e1f73fb914e13615",
"assets/AssetManifest.bin.json": "ee229e4834a0ea5b8463174a18c470ea",
"assets/AssetManifest.json": "afb0d0d07d234fa2bb7b68ea71f850da",
"assets/assets/images/basic.png": "3510f80ea5014fc2df54567994b5fb20",
"assets/assets/images/dahye.png": "ec54b2bc0000719d402411f939da4087",
"assets/assets/images/junyoung.png": "d9cc64747aff6d5af72f78060b78e68f",
"assets/assets/images/logo.png": "8a44e32032b7e49e8460beb70533b051",
"assets/assets/Nunito-Bold.ttf": "ba43cdecf9625c0dcec567ba29555e15",
"assets/assets/Nunito-Regular.ttf": "b83ce9c59c73ade26bb7871143fd76bb",
"assets/assets/OpenSans-Bold.ttf": "5112859ee40a5dfa527b3b4068ccd74d",
"assets/assets/OpenSans-Regular.ttf": "7df68ccfcb8ffe00669871052a4929c9",
"assets/assets/Oswald-Bold.ttf": "c95751378db3c5c8bfd993b164e13422",
"assets/assets/Oswald-Regular.ttf": "b299a657c45aa257f1458b327f491bfb",
"assets/FontManifest.json": "ff7adec34261a79d9cf9855621de1016",
"assets/fonts/MaterialIcons-Regular.otf": "0021eb2015d178e0538d001201ab0cc4",
"assets/NOTICES": "81f5ee2fdd2cecfebd2fbc84e6d9c6c8",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "9f85b22028f1a53d3c7d31de0d131a45",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "fea16fe100eb8be6ecdb13db2d411022",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "a46a60b3146078938fadbeaf05083cbc",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "8a44e32032b7e49e8460beb70533b051",
"flutter.js": "59a12ab9d00ae8f8096fffc417b6e84f",
"icons/icon-192.png": "847928c4472d69e00bf22c9b81065183",
"icons/icon-512.png": "dd2206d19184489176d9b6ca0bef27c3",
"icons/icon-maskable-192.png": "c940f4c31b9582e911e54fe0d2f3a8b0",
"icons/Icon-maskable-512.png": "0e92652bf86bfd6b7352e5be6a4b5f71",
"index.html": "bc670f835014e4564158130e3907e656",
"/": "bc670f835014e4564158130e3907e656",
"main.dart.js": "cd7cab667e0a201a2f467ba9f5f4be0f",
"manifest.json": "a009df9a56e4582672a12b6e016a6c3a",
"splash/img/dark-1x.png": "64d21fc7bd181d12b92b4841c9555b89",
"splash/img/dark-2x.png": "58a53116c5d472ffddf43d87babbff42",
"splash/img/dark-3x.png": "e75c40b0e1a99a62e740e768436b1e04",
"splash/img/dark-4x.png": "6a9b4ca7a94ec0f3e446c382c31b344a",
"splash/img/light-1x.png": "64d21fc7bd181d12b92b4841c9555b89",
"splash/img/light-2x.png": "58a53116c5d472ffddf43d87babbff42",
"splash/img/light-3x.png": "e75c40b0e1a99a62e740e768436b1e04",
"splash/img/light-4x.png": "6a9b4ca7a94ec0f3e446c382c31b344a",
"version.json": "7e3e3547a02fbce0624444c667d6d157"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
