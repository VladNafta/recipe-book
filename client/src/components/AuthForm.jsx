import { useState } from 'react'
import { api, fieldErrors } from '../api.js'

// Форма реєстрації / входу з перевіркою на клієнті і показом помилок сервера
export default function AuthForm({ mode, onDone, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const isRegister = mode === 'register'

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function check() {
    const e = {}
    if (isRegister && form.name.trim().length < 2) e.name = "Ім'я — щонайменше 2 символи"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Введіть коректний email'
    if (isRegister && !(form.password.length >= 8 && /\d/.test(form.password)))
      e.password = 'Пароль — від 8 символів і хоча б одна цифра'
    return e
  }

  async function submit(e) {
    e.preventDefault()
    const clientErrors = check()
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return
    try {
      const user = await api('POST', isRegister ? '/auth/register' : '/auth/login', form)
      onDone(user)
    } catch (err) {
      setErrors(fieldErrors(err))
    }
  }

  return (
    <form className="panel" onSubmit={submit} noValidate>
      <h2>{isRegister ? 'Реєстрація' : 'Вхід'}</h2>
      {isRegister && (
        <label>Ім'я
          <input name="name" value={form.name} onChange={change} />
          {errors.name && <span className="err">{errors.name}</span>}
        </label>
      )}
      <label>Email
        <input name="email" type="email" value={form.email} onChange={change} />
        {errors.email && <span className="err">{errors.email}</span>}
      </label>
      <label>Пароль
        <input name="password" type="password" value={form.password} onChange={change} />
        {errors.password && <span className="err">{errors.password}</span>}
      </label>
      {errors.form && <p className="err">{errors.form}</p>}
      <div className="actions">
        <button type="submit">{isRegister ? 'Зареєструватися' : 'Увійти'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Скасувати</button>
      </div>
    </form>
  )
}
