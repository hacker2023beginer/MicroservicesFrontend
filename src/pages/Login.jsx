import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', credentials);
            // Предполагаем, что бэкенд возвращает токен. Сохраняем его.
            localStorage.setItem('token', response.data.token);
            // Если userId зашит в токене, используй jwt-decode:
            // const decoded = jwtDecode(response.data.token);
            // localStorage.setItem('userId', decoded.id);
            
            navigate('/orders');
        } catch (error) {
            // Ошибка уже обработана в интерцепторе axios, но можно добавить локальную логику
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <h2 className="mb-3">Вход</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Логин</label>
                        <input type="text" className="form-control" 
                            onChange={e => setCredentials({...credentials, username: e.target.value})} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Пароль</label>
                        <input type="password" className="form-control" 
                            onChange={e => setCredentials({...credentials, password: e.target.value})} required/>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Войти</button>
                </form>
                <div className="mt-3 text-center">
                    <Link to="/register">Нет аккаунта? Зарегистрируйтесь</Link>
                </div>
            </div>
        </div>
    );
}