import RecipeCard from './RecipeCard.jsx'

// Список карток: рендериться з масиву, що прийшов з бази даних
export default function RecipeList({ recipes, favorites, onFav }) {
  if (recipes.length === 0) {
    return <p className="info">Нічого не знайдено</p>
  }

  return (
    <>
      <p className="count">Знайдено рецептів: {recipes.length}</p>
      <div className="grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} isFav={favorites.includes(r.id)} onFav={() => onFav(r.id)} />
        ))}
      </div>
    </>
  )
}
