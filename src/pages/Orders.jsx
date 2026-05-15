import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';

export default function Orders() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null); 
    const [orderItems, setOrderItems] = useState([]); 
    
    // НОВОЕ: Состояние для хранения каталога товаров
    const [catalog, setCatalog] = useState([]); 
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchOrders();
        fetchCatalog(); // Загружаем каталог товаров при открытии страницы
    }, [userId]);

    const fetchOrders = async () => {
        if (!userId || userId === 'null' || userId === 'undefined') return;
        try {
            const response = await api.get(`/orders/byuserid/${userId}`);
            const sortedOrders = response.data.sort((a, b) => b.id - a.id);
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Fetch orders error', error);
        }
    };

    // НОВОЕ: Метод получения всех товаров
    const fetchCatalog = async () => {
        try {
            const response = await api.get('/orders/items');
            setCatalog(response.data);
        } catch (error) {
            console.error('Fetch catalog error', error);
        }
    };

    const handlePay = async (orderId, totalPrice) => {
        try {
            await api.post('/payments', { orderId: String(orderId), userId: String(userId), paymentAmount: totalPrice });
            alert(t('orders.alerts.pay_success'));
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: 'PAID' } : order
            ));
        } catch (error) {
            console.error('Payment error', error);
            alert(t('orders.errors.pay_failed'));
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm(t('orders.alerts.delete_confirm'))) {
            try {
                await api.delete(`/orders/${orderId}`);
                setOrders(orders.filter(order => order.id !== orderId)); 
            } catch (error) {
                console.error('Delete error', error);
                alert(t('orders.errors.delete_failed'));
            }
        }
    };

    const toggleOrderDetails = async (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            setOrderItems([]);
            return;
        }
        
        setExpandedOrder(orderId);
        try {
            const response = await api.get(`/orders/orderitems/by-order/${orderId}`);
            setOrderItems(response.data);
        } catch (error) {
            console.error('Fetch items error', error);
        }
    };

    // НОВОЕ: Функция для поиска имени товара по ID
    const getItemName = (itemId) => {
        const item = catalog.find(c => c.id === itemId);
        return item ? item.name : `Товар ID: ${itemId}`;
    };

    return (
        <div>
            <h2 className="mb-4">{t('orders.title')}</h2>
            
            {orders.length === 0 ? (
                <div className="alert alert-info">{t('orders.empty')}</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>{t('orders.table.id')}</th>
                                <th>{t('orders.table.email')}</th>
                                <th>{t('orders.table.status')}</th>
                                <th>{t('orders.table.amount')}</th>
                                <th>{t('orders.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr>
                                        <td>{order.id}</td>
                                        <td>{order.email}</td>
                                        <td>
                                            <span className={`badge ${order.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td><strong>{order.totalPrice} $</strong></td>
                                        <td>
                                            <button 
                                                onClick={() => toggleOrderDetails(order.id)} 
                                                className="btn btn-sm btn-info me-2 text-white fw-bold"
                                            >
                                                {expandedOrder === order.id ? 'Скрыть товары' : 'Состав заказа'}
                                            </button>

                                            {order.status !== 'PAID' && (
                                                <button onClick={() => handlePay(order.id, order.totalPrice)} className="btn btn-sm btn-success me-2">
                                                    {t('orders.btn.pay')}
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(order.id)} className="btn btn-sm btn-danger">
                                                {t('orders.btn.delete')}
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedOrder === order.id && (
                                        <tr>
                                            <td colSpan="5" className="bg-light p-3">
                                                <h6 className="text-muted mb-3">Состав заказа #{order.id}:</h6>
                                                {orderItems.length === 0 ? (
                                                    <small className="text-muted">Загрузка товаров...</small>
                                                ) : (
                                                    <ul className="list-group">
                                                        {orderItems.map(item => (
                                                            <li key={item.id} className="list-group-item d-flex justify-content-between">
                                                                {/* ИСПОЛЬЗУЕМ ФУНКЦИЮ ДЛЯ ОТОБРАЖЕНИЯ ИМЕНИ */}
                                                                <span className="fw-bold">{getItemName(item.itemId)}</span>
                                                                <span className="text-muted">x {item.quantity} шт.</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}