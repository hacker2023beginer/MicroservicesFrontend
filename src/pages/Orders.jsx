import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null); // ID заказа, который мы сейчас редактируем
    
    const [formData, setFormData] = useState({ email: '', status: 'CREATED', totalPrice: 0 });
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        if (!userId || userId === 'null' || userId === 'undefined') return;
        try {
            const response = await api.get(`/orders/byuserid/${userId}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Не удалось загрузить заказы', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Открытие формы для СОЗДАНИЯ
    const handleOpenCreate = () => {
        setFormData({ email: '', status: 'CREATED', totalPrice: 0 });
        setEditingOrderId(null);
        setShowForm(true);
    };

    // Открытие формы для РЕДАКТИРОВАНИЯ
    const handleOpenEdit = (order) => {
        setFormData({ email: order.email, status: order.status, totalPrice: order.totalPrice });
        setEditingOrderId(order.id);
        setShowForm(true);
    };

    // Универсальный сабмит (и для создания, и для обновления)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const orderRequest = {
                userId: userId,
                email: formData.email,
                status: formData.status,
                totalPrice: parseFloat(formData.totalPrice)
            };

            if (editingOrderId) {
                // Если есть ID, делаем PUT запрос (Обновление)
                await api.put(`/orders/${editingOrderId}`, orderRequest);
                alert('Заказ успешно обновлен!');
            } else {
                // Если ID нет, делаем POST запрос (Создание)
                await api.post('/orders/createorder', orderRequest);
                alert('Заказ успешно создан!');
            }
            
            setShowForm(false);
            fetchOrders(); 
        } catch (error) {
            console.error('Ошибка сохранения заказа', error);
        }
    };

    const handlePay = async (orderId, totalPrice) => {
        try {
            await api.post('/payments', { orderId: String(orderId), userId: String(userId), paymentAmount: totalPrice });
            alert('Оплата прошла успешно!');
            fetchOrders(); 
        } catch (error) {
            console.error('Ошибка оплаты', error);
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                await api.delete(`/orders/${orderId}`);
                fetchOrders(); 
            } catch (error) {
                console.error('Ошибка удаления', error);
            }
        }
    };

    return (
        <div>
            <h2 className="mb-4">Мои заказы</h2>
            <button className={`btn mb-4 ${showForm && !editingOrderId ? 'btn-secondary' : 'btn-success'}`} onClick={handleOpenCreate}>
                {showForm && !editingOrderId ? 'Отменить создание' : 'Создать заказ'}
            </button>

            {showForm && (
                <div className="card shadow-sm mb-4 border-primary">
                    <div className="card-body">
                        <h5 className="card-title">{editingOrderId ? `Редактирование заказа #${editingOrderId}` : 'Новый заказ'}</h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Сумма</label>
                                <input type="number" step="0.01" min="0" name="totalPrice" className="form-control" value={formData.totalPrice} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Статус</label>
                                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                                    <option value="CREATED">CREATED</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="PAID">PAID</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary me-2">Сохранить</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {orders.length === 0 ? (
                <div className="alert alert-info">У вас пока нет заказов.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Статус</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.email}</td>
                                    <td><span className={`badge ${order.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span></td>
                                    <td><strong>{order.totalPrice}</strong></td>
                                    <td>
                                        {order.status !== 'PAID' && (
                                            <button onClick={() => handlePay(order.id, order.totalPrice)} className="btn btn-sm btn-success me-2">Оплатить</button>
                                        )}
                                        {/* Новая кнопка Изменить */}
                                        <button onClick={() => handleOpenEdit(order)} className="btn btn-sm btn-primary me-2">Изменить</button>
                                        <button onClick={() => handleDelete(order.id)} className="btn btn-sm btn-danger">Удалить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}