import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';

export default function Profile() {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [cards, setCards] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    
    const [newCard, setNewCard] = useState({
        number: '',
        holder: '',
        expirationDate: '',
        active: true
    });

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
            fetchUserCards();
        }
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setUser(response.data);
        } catch (error) {
            console.error(t('profile.errors.load_profile'), error);
        }
    };

    const fetchUserCards = async () => {
        try {
            const response = await api.get(`/users/${userId}/cards`);
            setCards(response.data);
        } catch (error) {
            console.error(t('profile.errors.load_cards'), error);
        }
    };

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/update/${userId}`, user);
            alert(t('profile.alerts.update_success'));
            setIsEditing(false);
            fetchUserProfile();
        } catch (error) {
            console.error(t('profile.errors.update_failed'), error);
            alert(t('profile.alerts.update_error'));
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const cardData = { ...newCard, userId: parseInt(userId) };
            await api.post('/users/cards', cardData);
            alert(t('profile.alerts.card_added'));
            setShowCardForm(false);
            setNewCard({ number: '', holder: '', expirationDate: '', active: true });
            fetchUserCards(); 
        } catch (error) {
            console.error(t('profile.errors.card_add_failed'), error);
            alert(t('profile.alerts.card_add_error'));
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (window.confirm(t('profile.alerts.card_del_confirm'))) {
            try {
                await api.delete(`/users/cards/${cardId}`);
                fetchUserCards(); 
            } catch (error) {
                console.error(t('profile.errors.card_del_failed'), error);
            }
        }
    };

    const toggleCardStatus = async (cardId, currentStatus) => {
        try {
            if (currentStatus) {
                await api.patch(`/users/cards/${cardId}/deactivate`);
            } else {
                await api.patch(`/users/cards/${cardId}/activate`);
            }
            fetchUserCards(); 
        } catch (error) {
            console.error(t('profile.errors.card_status_failed'), error);
        }
    };

    if (!user) return <div className="mt-4 text-center">{t('profile.loading')}</div>;

    return (
        <div className="row">
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{t('profile.title')}</h5>
                        <button className="btn btn-sm btn-outline-light" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? t('profile.btn.cancel') : t('profile.btn.edit')}
                        </button>
                    </div>
                    <div className="card-body">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3">
                                    <label className="form-label">{t('profile.form.name')}</label>
                                    <input type="text" name="name" className="form-control" 
                                        value={user.name || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t('profile.form.surname')}</label>
                                    <input type="text" name="surname" className="form-control" 
                                        value={user.surname || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t('profile.form.birthDate')}</label>
                                    <input type="date" name="birthDate" className="form-control" 
                                        value={user.birthDate || ''} onChange={handleInputChange} required />
                                </div>
                                <button type="submit" className="btn btn-success w-100">{t('profile.btn.save')}</button>
                            </form>
                        ) : (
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item"><strong>{t('profile.form.name')}:</strong> {user.name}</li>
                                <li className="list-group-item"><strong>{t('profile.form.surname')}:</strong> {user.surname}</li>
                                <li className="list-group-item"><strong>{t('profile.info.email')}:</strong> {user.email}</li>
                                <li className="list-group-item"><strong>{t('profile.form.birthDate')}:</strong> {user.birthDate}</li>
                                <li className="list-group-item">
                                    <strong>{t('profile.info.status')}:</strong> {user.active ? <span className="badge bg-success">{t('profile.status.active')}</span> : <span className="badge bg-danger">{t('profile.status.blocked')}</span>}
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-6">
                <div className="card shadow-sm border-secondary">
                    <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{t('profile.cards.title')}</h5>
                        <button className="btn btn-sm btn-light text-dark fw-bold" onClick={() => setShowCardForm(!showCardForm)}>
                            {showCardForm ? t('profile.btn.cancel') : t('profile.cards.add_btn')}
                        </button>
                    </div>
                    <div className="card-body">
                        {showCardForm && (
                            <form onSubmit={handleAddCard} className="mb-4 p-3 border rounded bg-light">
                                <div className="mb-2">
                                    <label className="form-label small fw-bold">{t('profile.cards.form.number')}</label>
                                    <input type="text" className="form-control form-control-sm" 
                                        maxLength="16" pattern="\d{16}" placeholder="1234567812345678" required
                                        value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-bold">{t('profile.cards.form.holder')}</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="IVAN IVANOV" required
                                        value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">{t('profile.cards.form.expiration')}</label>
                                    <input type="date" className="form-control form-control-sm" required
                                        value={newCard.expirationDate} onChange={e => setNewCard({...newCard, expirationDate: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm w-100">{t('profile.cards.form.submit')}</button>
                            </form>
                        )}

                        {cards.length === 0 ? (
                            <div className="alert alert-info">{t('profile.cards.empty')}</div>
                        ) : (
                            <div className="list-group">
                                {cards.map(card => (
                                    <div key={card.id} className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-bold fs-5">
                                                <i className="bi bi-credit-card me-2"></i>
                                                **** **** **** {card.number?.slice(-4)}
                                            </div>
                                            {card.active ? <span className="badge bg-success">{t('profile.cards.status.active')}</span> : <span className="badge bg-secondary">{t('profile.cards.status.inactive')}</span>}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <small className="text-muted text-uppercase">{card.holder} <br/> {t('profile.cards.valid_thru')} {card.expirationDate}</small>
                                            
                                            <div>
                                                <button 
                                                    className={`btn btn-sm me-2 ${card.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                    onClick={() => toggleCardStatus(card.id, card.active)}
                                                >
                                                    {card.active ? t('profile.cards.btn.disable') : t('profile.cards.btn.enable')}
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCard(card.id)}>
                                                    {t('profile.cards.btn.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}