import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();
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
            console.log(t('register.logs.sending'), formData); 
            await api.post('/register', formData);
            alert(t('register.alerts.success'));
            navigate('/login');
        } catch (error) {
            console.error(t('register.errors.failed'), error);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-5">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">{t('register.title')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">{t('register.form.username')}</label>
                                <input type="text" name="username" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('register.form.firstName')}</label>
                                <input type="text" name="firstName" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('register.form.lastName')}</label>
                                <input type="text" name="lastName" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('register.form.email')}</label>
                                <input type="email" name="email" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('register.form.birthDate')}</label>
                                <input type="date" name="birthDate" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">{t('register.form.password')}</label>
                                <input type="password" name="password" className="form-control" 
                                    onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn btn-success w-100">{t('register.btn.submit')}</button>
                        </form>
                        <div className="mt-3 text-center">
                            <Link to="/login" className="text-decoration-none">{t('register.links.login')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}