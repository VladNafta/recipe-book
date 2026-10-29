// Пошук за назвою і кнопки категорій
export default function Filters({ search, onSearch, categories, active, onCategory }) {
  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Пошук рецепта…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="categories">
        {categories.map((c) => (
          <button
            key={c}
            className={c === active ? 'active' : ''}
            onClick={() => onCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
