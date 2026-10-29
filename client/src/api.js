// Запит до API: cookie сесії браузер додає сам (той самий домен через проксі Vite)
export async function api(method, url, body) {
  const res = await fetch('/api' + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// Помилки сервера → об'єкт { поле: повідомлення }
export function fieldErrors(err) {
  const map = {}
  for (const e of err.errors ?? []) map[e.field] ??= e.message
  if (err.error) map.form = err.error
  return map
}
