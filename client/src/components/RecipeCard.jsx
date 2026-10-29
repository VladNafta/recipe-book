import { useState } from 'react'
import { api } from '../api.js'

const LEVEL = { 'легка': 'easy', 'середня': 'medium', 'складна': 'hard' }

// Картка рецепта; деталі розгортаються по кліку, серце додає в обрані,
// кнопка «AI-аналіз» показує оцінку рецепта від мовної моделі
export default function RecipeCard({ recipe, isFav, onFav }) {
  const [open, setOpen] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    setLoading(true)
    setError('')
    try {
      setAnalysis(await api('POST', `/ai/analyze/${recipe.id}`))
    } catch (err) {
      setError(err.error ?? 'Не вдалося отримати аналіз')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="card">
      <button className={isFav ? 'heart on' : 'heart'} onClick={onFav}
        title={isFav ? 'Прибрати з обраних' : 'Додати в обрані'}>
        {isFav ? '♥' : '♡'}
      </button>
      <span className="tag">{recipe.category}</span>
      <h3>{recipe.title}</h3>
      <p className="meta">
        ⏱ {recipe.cook_time} хв · 🍽 {recipe.servings} порц.
        {recipe.cook_time <= 30 && <span className="fast">Швидко</span>}
      </p>

      <div className="card-actions">
        <button className="link" onClick={() => setOpen(!open)}>
          {open ? 'Сховати' : 'Показати рецепт'}
        </button>
        {!analysis && (
          <button className="ai-btn" onClick={analyze} disabled={loading}>
            {loading ? 'Аналізую…' : '✨ AI-аналіз'}
          </button>
        )}
      </div>

      {error && <p className="err">{error}</p>}
      {analysis && (
        <div className="analysis">
          <span className={'level ' + LEVEL[analysis.difficulty]}>{analysis.difficulty}</span>
          <span className="kcal">~{analysis.calories} ккал/порц.</span>
          {analysis.tags.map((t) => <span key={t} className="ai-tag">#{t}</span>)}
          <p className="tip">💡 {analysis.tip}</p>
        </div>
      )}

      {open && (
        <div className="details">
          <ul>
            {recipe.ingredients.map((i) => <li key={i}>{i}</li>)}
          </ul>
          <p>{recipe.steps}</p>
        </div>
      )}
    </article>
  )
}
