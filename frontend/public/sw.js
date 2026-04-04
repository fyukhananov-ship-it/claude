const CACHE_NAME = 'clo-v1'
const ASSETS = ['/claude/', '/claude/index.html']

// Install — cache shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/claude/index.html')))
  )
})

// Push notifications
self.addEventListener('push', (e) => {
  let data = { title: 'Билайн CLO', body: 'Новое предложение!', url: '/claude/client/demo' }
  try {
    if (e.data) data = { ...data, ...e.data.json() }
  } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/claude/icons/icon-192.png',
      badge: '/claude/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'clo-notification',
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Позже' },
      ],
    })
  )
})

// Notification click — open the app
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || '/claude/client/demo'
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/claude') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
