import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    // Достаем сохраненный при логине ID пользователя
    const userId = localStorage.getItem('userId'); 

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get(`/orders/byuserid/${userId}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const handlePay = async (orderId, amount) => {
        try {
            // Запрос на твой PaymentServiceController
            await api.post('/payments', { orderId, amount, userId });
            alert('Оплата прошла успешно!');
            fetchOrders(); // Обновляем список
        } catch (error) {
            console.error('Payment failed');
        }
    };

    return (
        <div>
            <h2>Мои заказы</h2>
            <button className="btn btn-success mb-3">Создать заказ (UI для создания)</button>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Статус</th>
                        <th>Сумма</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.status}</td>
                            <td>{order.totalAmount}</td>
                            <td>
                                {order.status !== 'PAID' && (
                                    <button onClick={() => handlePay(order.id, order.totalAmount)} 
                                            className="btn btn-sm btn-primary me-2">
                                        Оплатить
                                    </button>
                                )}
                                <button className="btn btn-sm btn-danger">Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}