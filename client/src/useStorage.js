import { useState } from 'react'

// Стан, який зберігається у localStorage або sessionStorage браузера
export function useStorage(key, initial, storage = localStorage) {
  const [value, setValue] = useState(() => {
    try {
      const saved = storage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  // нове значення одразу записується у сховище і в стан компонента
  function save(newValue) {
    storage.setItem(key, JSON.stringify(newValue))
    setValue(newValue)
  }

  return [value, save]
}
