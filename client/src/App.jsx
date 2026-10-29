import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { useStorage } from './useStorage.js'
import Header from './components/Header.jsx'
import AuthForm from './components/AuthForm.jsx'
import RecipeForm from './components/RecipeForm.jsx'
import Filters from './components/Filters.jsx'
import RecipeList from './components/RecipeList.jsx'

export default function App() {
  const [recipes, setRecipes] = useState([])
  const [user, setUser] = useState(null)
  const [panel, setPanel] = useState(null) // 'login' | 'register' | 'add'
  const [search, setSearch] = useState('')
  // вибрана категорія живе до закриття вкладки (sessionStorage)
  const [category, setCategory] = useStorage('category', 'Усі', sessionStorage)
  // обрані рецепти зберігаються між візитами (localStorage)
  const [favorites, setFavorites] = useStorage('favorites', [])
  const [onlyFav, setOnlyFav] = useState(false)

  useEffect(() => {
    api('GET', '/recipes').then(setRecipes)
    api('GET', '/auth/me').then(setUser).catch(() => setUser(null)) // чи є активна сесія
  }, [])

  const toggleFav = (id) =>
    setFavorites(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id])

  async function logout() {
    await api('POST', '/auth/logout')
    setUser(null)
    setPanel(null)
  }

  const categories = ['Усі', ...new Set(recipes.map((r) => r.category))]
  const visible = useMemo(() => recipes.filter((r) =>
    (category === 'Усі' || r.category === category) &&
    (!onlyFav || favorites.includes(r.id)) &&
    r.title.toLowerCase().includes(search.toLowerCase())
  ), [recipes, category, search, onlyFav, favorites])

  return (
    <div className="app">
      <Header user={user} onLogin={() => setPanel('login')} onRegister={() => setPanel('register')}
        onLogout={logout} onAdd={() => setPanel('add')} />

      {(panel === 'login' || panel === 'register') && (
        <AuthForm key={panel} mode={panel} onCancel={() => setPanel(null)}
          onDone={(u) => { setUser(u); setPanel(null) }} />
      )}
      {panel === 'add' && user && (
        <RecipeForm onCancel={() => setPanel(null)}
          onCreated={(r) => { setRecipes([...recipes, r]); setPanel(null) }} />
      )}

      <Filters search={search} onSearch={setSearch} categories={categories} active={category}
        onCategory={setCategory} onlyFav={onlyFav} onOnlyFav={setOnlyFav} favCount={favorites.length} />
      <RecipeList recipes={visible} favorites={favorites} onFav={toggleFav} />
    </div>
  )
}
