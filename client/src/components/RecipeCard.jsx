import { useState } from 'react'

// Картка рецепта; деталі розгортаються по кліку, серце додає в обрані
export default function RecipeCard({ recipe, isFav, onFav }) {
  const [open, setOpen] = useState(false)

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

      <button className="link" onClick={() => setOpen(!open)}>
        {open ? 'Сховати' : 'Показати рецепт'}
      </button>

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
