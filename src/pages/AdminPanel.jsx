import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminPanel() {
    // Состояния для пользователей
    const [usersPage, setUsersPage] = useState({ content: [], totalPages: 0 });
    const [userPageNum, setUserPageNum] = useState(0);

    // Состояния для заказов
    const [ordersPage, setOrdersPage] = useState({ content: [], totalPages: 0 });
    const [filters, setFilters] = useState({ status: '', from: '', to: '' });

    // Состояние для глобальной выручки
    const [globalSum, setGlobalSum] = useState(0);

    // НОВОЕ: Состояния для товаров (Items)
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', price: '' });

    useEffect(() => {
        fetchUsers(userPageNum);
        fetchGlobalSum();
        fetchFilteredOrders();
        fetchItems(); // Загружаем товары при открытии админки
    }, [userPageNum]);

    const fetchUsers = async (page) => {
        try {
            const response = await api.get(`/users?page=${page}&size=5`);
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setUsersPage(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей', error);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus) {
                await api.patch(`/users/deactivate/${userId}`);
            } else {
                await api.patch(`/users/activate/${userId}`);
            }
            fetchUsers(userPageNum); 
        } catch (error) {
            console.error('Ошибка изменения статуса', error);
        }
    };

    const fetchFilteredOrders = async () => {
        try {
            const fromDate = filters.from ? `${filters.from}T00:00:00` : '2000-01-01T00:00:00';
            const toDate = filters.to ? `${filters.to}T23:59:59` : '2099-12-31T23:59:59';
            const statusParam = filters.status ? filters.status : '';

            const query = `/orders?page=0&size=50&from=${fromDate}&to=${toDate}&status=${statusParam}`;
            const response = await api.get(query);
            
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setOrdersPage(data);
        } catch (error) {
            console.error('Ошибка поиска заказов', error);
        }
    };

    const fetchGlobalSum = async () => {
        try {
            const response = await api.get('/payments/sum', {
                // Добавили 'Z' на конце обеих дат!
                params: { from: '2000-01-01T00:00:00Z', to: '2099-12-31T23:59:59Z' }
            });
            setGlobalSum(response.data);
        } catch (error) {
            console.error('Ошибка загрузки глобальной суммы', error);
        }
    };

    // НОВОЕ: Загрузка списка товаров
    const fetchItems = async () => {
        try {
            const response = await api.get('/orders/items');
            setItems(response.data);
        } catch (error) {
            console.error('Ошибка загрузки товаров', error);
        }
    };

    // НОВОЕ: Создание товара
    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders/items/create', {
                name: newItem.name,
                price: parseFloat(newItem.price)
            });
            alert('Товар успешно добавлен в каталог!');
            setNewItem({ name: '', price: '' }); // Очищаем форму
            fetchItems(); // Обновляем список
        } catch (error) {
            console.error('Ошибка создания товара', error);
            alert('Не удалось создать товар.');
        }
    };

    // НОВОЕ: Удаление товара
    const handleDeleteItem = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар из каталога?')) {
            try {
                await api.delete(`/orders/items/${id}`);
                fetchItems();
            } catch (error) {
                console.error('Ошибка удаления товара', error);
                alert('Ошибка удаления. Возможно, товар уже используется в чьем-то заказе.');
            }
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4 text-danger border-bottom pb-2">Панель Администратора</h2>

            <div className="row">
                {/* БЛОК 1: Управление пользователями */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Управление пользователями</h5>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Email</th>
                                        <th>Имя</th>
                                        <th>Статус</th>
                                        <th>Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersPage.content?.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.email}</td>
                                            <td>{u.name} {u.surname}</td>
                                            <td>
                                                <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                                                    {u.active ? 'Активен' : 'Забанен'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                    onClick={() => toggleUserStatus(u.id, u.active)}
                                                >
                                                    {u.active ? 'Заблокировать' : 'Разблокировать'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum === 0} 
                                    onClick={() => setUserPageNum(userPageNum - 1)}>Назад</button>
                                <span>Страница {userPageNum + 1} из {usersPage.totalPages}</span>
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum >= (usersPage.totalPages - 1)} 
                                    onClick={() => setUserPageNum(userPageNum + 1)}>Вперед</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* БЛОК 2: Глобальная статистика и поиск заказов */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm mb-4 border-success">
                        <div className="card-body text-center bg-success text-white rounded">
                            <h4>Общая выручка платформы</h4>
                            <h2 className="display-5 fw-bold">{globalSum} $</h2>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Глобальный поиск заказов</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-2 mb-3">
                                <div className="col-md-4">
                                    <input type="date" className="form-control form-control-sm" 
                                        onChange={e => setFilters({...filters, from: e.target.value})} />
                                </div>
                                <div className="col-md-4">
                                    <input type="date" className="form-control form-control-sm" 
                                        onChange={e => setFilters({...filters, to: e.target.value})} />
                                </div>
                                <div className="col-md-4">
                                    <select className="form-select form-select-sm" 
                                        onChange={e => setFilters({...filters, status: e.target.value})}>
                                        <option value="">Все статусы</option>
                                        <option value="CREATED">CREATED</option>
                                        <option value="PAID">PAID</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-sm btn-primary w-100" onClick={fetchFilteredOrders}>Найти</button>
                                </div>
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <ul className="list-group list-group-flush">
                                    {ordersPage.content?.map(order => (
                                        <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>Заказ #{order.id}</strong> <small className="text-muted">({order.email})</small>
                                            </div>
                                            <div>
                                                <span className="me-3 fw-bold">{order.totalPrice} $</span>
                                                <span className="badge bg-secondary">{order.status}</span>
                                            </div>
                                        </li>
                                    ))}
                                    {ordersPage.content?.length === 0 && <small className="text-muted">Ничего не найдено</small>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* НОВЫЙ БЛОК 3: Управление Каталогом (Items) */}
            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card shadow-sm border-warning">
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Управление каталогом товаров (Витрина)</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {/* Форма добавления */}
                                <div className="col-md-4 border-end">
                                    <h6 className="mb-3">Добавить новый товар</h6>
                                    <form onSubmit={handleCreateItem}>
                                        <div className="mb-2">
                                            <label className="form-label small">Название товара</label>
                                            <input type="text" className="form-control form-control-sm" required
                                                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} 
                                                placeholder="Например: Смартфон X" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small">Цена ($)</label>
                                            <input type="number" step="0.01" min="0" className="form-control form-control-sm" required
                                                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} 
                                                placeholder="999.99" />
                                        </div>
                                        <button type="submit" className="btn btn-sm btn-success w-100">Добавить в каталог</button>
                                    </form>
                                </div>
                                
                                {/* Список существующих товаров */}
                                <div className="col-md-8">
                                    <h6 className="mb-3">Текущие товары в магазине</h6>
                                    {items.length === 0 ? (
                                        <div className="alert alert-secondary py-2">Каталог пуст. Добавьте первый товар!</div>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-hover align-middle">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Название</th>
                                                        <th>Цена</th>
                                                        <th className="text-end">Действие</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="text-muted small">{item.id}</td>
                                                            <td className="fw-bold">{item.name}</td>
                                                            <td className="text-success fw-bold">{item.price} $</td>
                                                            <td className="text-end">
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i> Удалить
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}