import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Не забудь этот импорт для проверки роли!

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Функция проверки роли (чтобы показывать Админку только админам)
    const checkIsAdmin = () => {
        if (!token) return false;
        try {
            const decoded = jwtDecode(token);
            const role = decoded.role || decoded.roles || decoded.authorities || '';
            return JSON.stringify(role).toUpperCase().includes('ADMIN');
        } catch {
            return false;
        }
    };

    const isAdmin = checkIsAdmin();

    const handleLogout = () => {
        // Очищаем данные сессии (теперь очищаем и refreshToken тоже!)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/orders">MicroApp</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    {/* ЛЕВАЯ ЧАСТЬ МЕНЮ: Ссылки навигации */}
                    <ul className="navbar-nav me-auto">
                        {token && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-warning fw-bold" to="/shop">Магазин</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cart">Корзина</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">Мои заказы</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/payments">Платежи</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-info fw-bold" to="/profile">Мой профиль</Link>
                                </li>
                                
                                {/* Показываем кнопку только АДМИНАМ */}
                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-danger fw-bold ms-3" to="/admin">Админка</Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                    
                    {/* ПРАВАЯ ЧАСТЬ МЕНЮ: Авторизация и Выход */}
                    <ul className="navbar-nav ms-auto">
                        {token ? (
                            <li className="nav-item">
                                <button className="btn btn-outline-light btn-sm mt-1" onClick={handleLogout}>
                                    Выйти
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Вход</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Регистрация</Link>
                                </li>
                            </>
                        )}
                    </ul>

                </div>
            </div>
        </nav>
    );
}