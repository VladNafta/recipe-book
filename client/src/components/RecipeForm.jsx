import { useState } from 'react'
import { api, fieldErrors } from '../api.js'
import { useStorage } from '../useStorage.js'

const CATEGORIES = ['Перші страви', 'Другі страви', 'Салати', 'Десерти']
const EMPTY = { title: '', category: 'Перші страви', cook_time: '', servings: '', ingredients: '', steps: '' }

// Форма додавання рецепта; незавершена чернетка зберігається в localStorage
export default function RecipeForm({ onCreated, onCancel }) {
  const [form, setForm] = useStorage('recipeDraft', EMPTY)
  const [errors, setErrors] = useState({})

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    // обробка даних форми: рядок інгредієнтів → масив, числа → Number
    const data = {
      ...form,
      title: form.title.trim(),
      cook_time: Number(form.cook_time),
      servings: Number(form.servings),
      ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      const recipe = await api('POST', '/recipes', data)
      setForm(EMPTY) // чернетку очищено після успішного збереження
      setErrors({})
      onCreated(recipe)
    } catch (err) {
      setErrors(fieldErrors(err))
    }
  }

  const field = (name, label, props = {}) => (
    <label>{label}
      <input name={name} value={form[name]} onChange={change} {...props} />
      {errors[name] && <span className="err">{errors[name]}</span>}
    </label>
  )

  return (
    <form className="panel" onSubmit={submit} noValidate>
      <h2>Новий рецепт</h2>
      {field('title', 'Назва')}
      <label>Категорія
        <select name="category" value={form.category} onChange={change}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <div className="row">
        {field('cook_time', 'Час, хв', { type: 'number' })}
        {field('servings', 'Порцій', { type: 'number' })}
      </div>
      {field('ingredients', 'Інгредієнти (через кому)')}
      <label>Приготування
        <textarea name="steps" rows="3" value={form.steps} onChange={change} />
        {errors.steps && <span className="err">{errors.steps}</span>}
      </label>
      {errors.form && <p className="err">{errors.form}</p>}
      <div className="actions">
        <button type="submit">Зберегти</button>
        <button type="button" className="secondary" onClick={onCancel}>Закрити</button>
      </div>
    </form>
  )
}
