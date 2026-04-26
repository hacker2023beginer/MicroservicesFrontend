import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
    // В LoginRequest поля называются login и password
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', credentials);
            const token = response.data.accessToken; // Поле из LoginResponse
            const refreshToken = response.data.refreshToken;

            if (token) {
                localStorage.setItem('token', token);
                
                // Расшифровываем токен, чтобы попытаться достать ID или Email
                const decoded = jwtDecode(token);
                let userId = decoded.id || decoded.userId;

                // Если в токене есть только email (sub), запрашиваем ID у бэкенда
                if (!userId && decoded.sub) {
                    const userResponse = await api.get(`/users/email?email=${decoded.sub}`);
                    userId = userResponse.data.id;
                }

                if (userId) {
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('refreshToken', refreshToken);
                    navigate('/orders');
                } else {
                    alert('Ошибка: не удалось получить ID пользователя из системы.');
                }
            }
        } catch (error) {
            console.error("Ошибка входа", error);
            alert("Неверный логин или пароль");
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">Вход</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Логин</label>
                                {/* name="login" строго совпадает с LoginRequest */}
                                <input type="text" name="login" className="form-control" 
                                    onChange={handleChange} required/>
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Пароль</label>
                                <input type="password" name="password" className="form-control" 
                                    onChange={handleChange} required/>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Войти</button>
                        </form>
                        <div className="mt-3 text-center">
                            <Link to="/register" className="text-decoration-none">Нет аккаунта? Зарегистрируйтесь</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}