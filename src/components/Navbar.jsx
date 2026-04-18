import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        // Очищаем данные сессии и редиректим на логин
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/orders">MicroApp</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {/* Показываем ссылки только авторизованным */}
                        {token && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">Заказы</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/payments">Платежи</Link>
                                </li>
                            </>
                        )}
                    </ul>
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