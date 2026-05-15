import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next'; // <-- Импортируем хук переводов

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Подключаем функцию перевода (t) и сам объект i18n для смены языка
    const { t, i18n } = useTranslation();

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
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    // Функция для переключения языка
    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('ru') ? 'en' : 'ru';
        i18n.changeLanguage(newLang);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                {/* Используем t() для перевода */}
                <Link className="navbar-brand fw-bold" to="/orders">{t('navbar.brand')}</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    <ul className="navbar-nav me-auto">
                        {token && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-warning fw-bold" to="/shop">{t('navbar.shop')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cart">{t('navbar.cart')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">{t('navbar.orders')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/payments">{t('navbar.payments')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-info fw-bold" to="/profile">{t('navbar.profile')}</Link>
                                </li>
                                
                                {isAdmin && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-danger fw-bold ms-3" to="/admin">{t('navbar.admin')}</Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                    
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА */}
                        <li className="nav-item me-3">
                            <button 
                                className="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold" 
                                onClick={toggleLanguage}
                            >
                                {t('navbar.switchLang')}
                            </button>
                        </li>

                        {token ? (
                            <li className="nav-item">
                                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                                    {t('navbar.logout')}
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">{t('navbar.login')}</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">{t('navbar.register')}</Link>
                                </li>
                            </>
                        )}
                    </ul>

                </div>
            </div>
        </nav>
    );
}