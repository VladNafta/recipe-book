import { useEffect, useMemo, useState } from 'react'
import Filters from './components/Filters.jsx'
import RecipeList from './components/RecipeList.jsx'

export default function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Усі')

  // Завантаження рецептів з бази даних через API
  useEffect(() => {
    fetch('/api/recipes')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setRecipes)
      .catch(() => setError('Не вдалося завантажити рецепти'))
      .finally(() => setLoading(false))
  }, [])

  // Категорії беруться з самих даних, а не задаються вручну
  const categories = ['Усі', ...new Set(recipes.map((r) => r.category))]

  const visible = useMemo(() => recipes.filter((r) =>
    (category === 'Усі' || r.category === category) &&
    r.title.toLowerCase().includes(search.toLowerCase())
  ), [recipes, category, search])

  return (
    <div className="app">
      <h1>Записник рецептів</h1>
      <Filters search={search} onSearch={setSearch} categories={categories}
        active={category} onCategory={setCategory} />
      {loading && <p className="info">Завантаження…</p>}
      {error && <p className="info error">{error}</p>}
      {!loading && !error && <RecipeList recipes={visible} />}
    </div>
  )
}
