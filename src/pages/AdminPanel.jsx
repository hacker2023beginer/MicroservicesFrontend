import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminPanel() {
    // Состояния для пользователей
    const [usersPage, setUsersPage] = useState({ content: [], totalPages: 0 });
    const [userPageNum, setUserPageNum] = useState(0);

    // Состояния для заказов (глобальный поиск)
    const [ordersPage, setOrdersPage] = useState({ content: [], totalPages: 0 });
    const [filters, setFilters] = useState({ status: '', from: '', to: '' });

    // Состояние для глобальной выручки
    const [globalSum, setGlobalSum] = useState(0);

    useEffect(() => {
        fetchUsers(userPageNum);
        fetchGlobalSum();
        fetchFilteredOrders();
    }, [userPageNum]);

    // 1. ДЕМОНСТРАЦИЯ: GET /users (с пагинацией)
    const fetchUsers = async (page) => {
        try {
            const response = await api.get(`/users?page=${page}&size=5`);
            // Если Gateway отдал сырую строку, принудительно парсим её в JSON
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setUsersPage(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей', error);
        }
    };

    // 2. ДЕМОНСТРАЦИЯ: PATCH /activate и /deactivate
    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus) {
                await api.patch(`/users/deactivate/${userId}`);
            } else {
                await api.patch(`/users/activate/${userId}`);
            }
            fetchUsers(userPageNum); // Обновляем список
        } catch (error) {
            console.error('Ошибка изменения статуса', error);
        }
    };

    // 3. ДЕМОНСТРАЦИЯ: GET /orders (Все параметры обязательны, даты без 'Z')
    const fetchFilteredOrders = async () => {
        try {
            // Бэкенд ТРЕБУЕТ даты всегда, поэтому ставим дефолтные значения (без Z!)
            const fromDate = filters.from ? `${filters.from}T00:00:00` : '2000-01-01T00:00:00';
            const toDate = filters.to ? `${filters.to}T23:59:59` : '2099-12-31T23:59:59';
            
            // Бэкенд ТРЕБУЕТ статус всегда. Если фильтр пустой, отправляем пустую строку
            const statusParam = filters.status ? filters.status : '';

            // Собираем полный URL со всеми тремя параметрами
            const query = `/orders?page=0&size=50&from=${fromDate}&to=${toDate}&status=${statusParam}`;

            const response = await api.get(query);
            
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setOrdersPage(data);
        } catch (error) {
            console.error('Ошибка поиска заказов', error);
        }
    };

    // 4. ДЕМОНСТРАЦИЯ: GET /payments/sum
    const fetchGlobalSum = async () => {
        try {
            const response = await api.get('/payments/sum', {
                params: { from: '2000-01-01T00:00:00Z', to: '2099-12-31T23:59:59Z' }
            });
            setGlobalSum(response.data);
        } catch (error) {
            console.error('Ошибка загрузки глобальной суммы', error);
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
                            {/* Простая пагинация */}
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum === 0} 
                                    onClick={() => setUserPageNum(userPageNum - 1)}>Назад</button>
                                <span>Страница {userPageNum + 1} из {usersPage.totalPages}</span>
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum >= usersPage.totalPages - 1} 
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

                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
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
        </div>
    );
}