// Пошук за назвою, кнопки категорій і перемикач «Обрані»
export default function Filters({ search, onSearch, categories, active, onCategory, onlyFav, onOnlyFav, favCount }) {
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
          <button key={c} className={c === active ? 'active' : ''} onClick={() => onCategory(c)}>
            {c}
          </button>
        ))}
        <button className={onlyFav ? 'active fav' : 'fav'} onClick={() => onOnlyFav(!onlyFav)}>
          ♥ Обрані ({favCount})
        </button>
      </div>
    </div>
  )
}
