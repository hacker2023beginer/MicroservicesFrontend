import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [email, setEmail] = useState(''); // Email нужен для OrderRequest
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
        fetchUserEmail();
    }, []);

    // Подтягиваем email пользователя для оформления заказа
    const fetchUserEmail = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setEmail(response.data.email);
        } catch (error) {
            console.error('Ошибка загрузки профиля', error);
        }
    };

    const removeFromCart = (itemId) => {
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // ГЛАВНАЯ ФУНКЦИЯ: ОФОРМЛЕНИЕ ЗАКАЗА
    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Корзина пуста!');
        if (!email) return alert('Укажите email для оформления заказа');

        try {
            // 1. Создаем сам заказ (Order)
            const orderRequest = {
                userId: parseInt(userId),
                status: 'CREATED',
                totalPrice: calculateTotal(),
                email: email
            };
            
            const orderResponse = await api.post('/orders/createorder', orderRequest);
            const newOrderId = orderResponse.data.id;

            // 2. Добавляем товары в заказ (OrderItems)
            // Используем Promise.all, чтобы дождаться сохранения всех позиций
            const orderItemsPromises = cart.map(item => {
                const orderItemReq = {
                    orderId: newOrderId,
                    itemId: item.id,
                    quantity: item.quantity
                };
                return api.post('/orders/orderitems', orderItemReq);
            });

            await Promise.all(orderItemsPromises);

            // 3. Очищаем корзину и отправляем платить
            localStorage.removeItem('cart');
            alert('Заказ успешно оформлен! Переходим к оплате.');
            navigate('/orders'); // Перекидываем на страницу заказов

        } catch (error) {
            console.error('Ошибка при оформлении заказа', error);
            alert('Произошла ошибка при оформлении. Проверьте консоль.');
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2 className="mb-4">Корзина</h2>
                
                {cart.length === 0 ? (
                    <div className="alert alert-secondary">Ваша корзина пуста. <a href="/shop">Перейти в магазин</a></div>
                ) : (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <ul className="list-group list-group-flush mb-4">
                                {cart.map(item => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="fw-bold">{item.name}</span>
                                            <span className="text-muted ms-2">x {item.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="me-3 fw-bold text-success">{item.price * item.quantity} $</span>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}>
                                                <i className="bi bi-trash"></i> Удалить
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="d-flex justify-content-between align-items-end p-3 bg-light rounded">
                                <div>
                                    <label className="form-label small text-muted mb-1">Email для подтверждения:</label>
                                    <input type="email" className="form-control form-control-sm" 
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="text-end">
                                    <h5 className="mb-1">Итого: <span className="text-primary fw-bold">{calculateTotal()} $</span></h5>
                                    <button className="btn btn-success mt-2" onClick={handleCheckout}>
                                        Оформить заказ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}