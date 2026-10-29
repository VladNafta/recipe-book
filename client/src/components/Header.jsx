// Шапка: ім'я користувача з сесії або кнопки входу
export default function Header({ user, onLogin, onRegister, onLogout, onAdd }) {
  return (
    <header className="header">
      <h1>Записник рецептів</h1>
      {user ? (
        <div className="user">
          <span>Вітаємо, <b>{user.name}</b></span>
          <button onClick={onAdd}>+ Рецепт</button>
          <button className="secondary" onClick={onLogout}>Вийти</button>
        </div>
      ) : (
        <div className="user">
          <button onClick={onLogin}>Увійти</button>
          <button className="secondary" onClick={onRegister}>Реєстрація</button>
        </div>
      )}
    </header>
  )
}
