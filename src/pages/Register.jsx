import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    // Стейт теперь 100% совпадает с RegistrationRequest на бэкенде
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        birthDate: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Вывод в консоль, чтобы ты мог сам увидеть, что отправляется правильный JSON
            console.log("Отправляем данные:", formData); 
            await api.post('/register', formData);
            alert('Успешная регистрация! Теперь вы можете войти.');
            navigate('/login');
        } catch (error) {
            console.error("Ошибка регистрации", error);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-5">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">Регистрация</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Имя пользователя (Логин)</label>
                                <input type="text" name="username" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Имя</label>
                                <input type="text" name="firstName" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Фамилия</label>
                                <input type="text" name="lastName" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Дата рождения</label>
                                {/* type="date" автоматически сформирует строку в формате YYYY-MM-DD, что идеально подходит для LocalDate */}
                                <input type="date" name="birthDate" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Пароль</label>
                                <input type="password" name="password" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn btn-success w-100">Зарегистрироваться</button>
                        </form>
                        <div className="mt-3 text-center">
                            <Link to="/login" className="text-decoration-none">Уже есть аккаунт? Войти</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}