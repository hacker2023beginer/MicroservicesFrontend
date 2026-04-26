import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next'; // <-- Импорт хука

export default function Login() {
    const { t } = useTranslation(); // <-- Инициализация
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', credentials);
            const token = response.data.accessToken; 
            const refreshToken = response.data.refreshToken;

            if (token) {
                localStorage.setItem('token', token);
                
                const decoded = jwtDecode(token);
                let userId = decoded.id || decoded.userId;

                if (!userId && decoded.sub) {
                    const userResponse = await api.get(`/users/email?email=${decoded.sub}`);
                    userId = userResponse.data.id;
                }

                if (userId) {
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('refreshToken', refreshToken);
                    navigate('/orders');
                } else {
                    alert(t('login.alerts.no_id'));
                }
            }
        } catch (error) {
            console.error("Login error", error);
            alert(t('login.alerts.invalid_creds'));
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">{t('login.title')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">{t('login.login_label')}</label>
                                <input type="text" name="login" className="form-control" 
                                    onChange={handleChange} required/>
                            </div>
                            <div className="mb-4">
                                <label className="form-label">{t('login.password_label')}</label>
                                <input type="password" name="password" className="form-control" 
                                    onChange={handleChange} required/>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">{t('login.submit_btn')}</button>
                        </form>
                        <div className="mt-3 text-center">
                            <Link to="/register" className="text-decoration-none">{t('login.no_account')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}