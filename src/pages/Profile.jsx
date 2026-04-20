import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Profile() {
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
            console.error('Ошибка загрузки профиля', error);
        }
    };

    const fetchUserCards = async () => {
        try {
            const response = await api.get(`/users/${userId}/cards`);
            setCards(response.data);
        } catch (error) {
            console.error('Ошибка загрузки карт', error);
        }
    };

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/update/${userId}`, user);
            alert('Профиль успешно обновлен!');
            setIsEditing(false);
            fetchUserProfile();
        } catch (error) {
            console.error('Ошибка обновления профиля', error);
            alert('Не удалось обновить профиль.');
        }
    };

    // --- НОВЫЕ МЕТОДЫ ДЛЯ КАРТ ИЗ ТВОЕГО КОНТРОЛЛЕРА ---

    // 1. Создание карты (POST /users/cards)
    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const cardData = { ...newCard, userId: parseInt(userId) };
            await api.post('/users/cards', cardData);
            alert('Карта успешно добавлена!');
            setShowCardForm(false);
            setNewCard({ number: '', holder: '', expirationDate: '', active: true });
            fetchUserCards(); 
        } catch (error) {
            console.error('Ошибка при добавлении карты', error);
            alert('Не удалось добавить карту. Проверьте данные.');
        }
    };

    // 2. Удаление карты (DELETE /users/cards/{id})
    const handleDeleteCard = async (cardId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
            try {
                await api.delete(`/users/cards/${cardId}`);
                fetchUserCards(); // Обновляем список
            } catch (error) {
                console.error('Ошибка удаления карты', error);
            }
        }
    };

    // 3. Изменение статуса карты (PATCH /users/cards/{id}/activate|deactivate)
    const toggleCardStatus = async (cardId, currentStatus) => {
        try {
            if (currentStatus) {
                // Если активна - деактивируем
                await api.patch(`/users/cards/${cardId}/deactivate`);
            } else {
                // Если неактивна - активируем
                await api.patch(`/users/cards/${cardId}/activate`);
            }
            fetchUserCards(); // Обновляем список
        } catch (error) {
            console.error('Ошибка изменения статуса карты', error);
        }
    };

    if (!user) return <div className="mt-4 text-center">Загрузка профиля...</div>;

    return (
        <div className="row">
            {/* БЛОК ПРОФИЛЯ */}
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мой профиль</h5>
                        <button className="btn btn-sm btn-outline-light" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Отменить' : 'Редактировать'}
                        </button>
                    </div>
                    <div className="card-body">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3">
                                    <label className="form-label">Имя</label>
                                    <input type="text" name="name" className="form-control" 
                                        value={user.name || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Фамилия</label>
                                    <input type="text" name="surname" className="form-control" 
                                        value={user.surname || ''} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Дата рождения</label>
                                    <input type="date" name="birthDate" className="form-control" 
                                        value={user.birthDate || ''} onChange={handleInputChange} required />
                                </div>
                                <button type="submit" className="btn btn-success w-100">Сохранить изменения</button>
                            </form>
                        ) : (
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item"><strong>Имя:</strong> {user.name}</li>
                                <li className="list-group-item"><strong>Фамилия:</strong> {user.surname}</li>
                                <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
                                <li className="list-group-item"><strong>Дата рождения:</strong> {user.birthDate}</li>
                                <li className="list-group-item">
                                    <strong>Статус:</strong> {user.active ? <span className="badge bg-success">Активен</span> : <span className="badge bg-danger">Заблокирован</span>}
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* БЛОК КАРТ */}
            <div className="col-md-6">
                <div className="card shadow-sm border-secondary">
                    <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мои карты</h5>
                        <button className="btn btn-sm btn-light text-dark fw-bold" onClick={() => setShowCardForm(!showCardForm)}>
                            {showCardForm ? 'Отмена' : '+ Добавить карту'}
                        </button>
                    </div>
                    <div className="card-body">
                        {/* ФОРМА ДОБАВЛЕНИЯ КАРТЫ */}
                        {showCardForm && (
                            <form onSubmit={handleAddCard} className="mb-4 p-3 border rounded bg-light">
                                <div className="mb-2">
                                    <label className="form-label small fw-bold">Номер карты (16 цифр)</label>
                                    <input type="text" className="form-control form-control-sm" 
                                        maxLength="16" pattern="\d{16}" placeholder="1234567812345678" required
                                        value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-bold">Имя владельца</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="IVAN IVANOV" required
                                        value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Срок действия</label>
                                    <input type="date" className="form-control form-control-sm" required
                                        value={newCard.expirationDate} onChange={e => setNewCard({...newCard, expirationDate: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm w-100">Сохранить карту</button>
                            </form>
                        )}

                        {/* СПИСОК КАРТ */}
                        {cards.length === 0 ? (
                            <div className="alert alert-info">У вас пока нет привязанных карт.</div>
                        ) : (
                            <div className="list-group">
                                {cards.map(card => (
                                    <div key={card.id} className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-bold fs-5">
                                                <i className="bi bi-credit-card me-2"></i>
                                                **** **** **** {card.number?.slice(-4)}
                                            </div>
                                            {card.active ? <span className="badge bg-success">Активна</span> : <span className="badge bg-secondary">Неактивна</span>}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <small className="text-muted text-uppercase">{card.holder} <br/> Годен до: {card.expirationDate}</small>
                                            
                                            {/* Кнопки управления картой */}
                                            <div>
                                                <button 
                                                    className={`btn btn-sm me-2 ${card.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                    onClick={() => toggleCardStatus(card.id, card.active)}
                                                >
                                                    {card.active ? 'Отключить' : 'Включить'}
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCard(card.id)}>
                                                    Удалить
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