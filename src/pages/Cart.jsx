import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next'; // Импорт хука

export default function Cart() {
    const { t } = useTranslation(); // Инициализация
    const [cart, setCart] = useState([]);
    const [email, setEmail] = useState('');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
        fetchUserEmail();
    }, []);

    const fetchUserEmail = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setEmail(response.data.email);
        } catch (error) {
            console.error(t('cart.errors.profile'), error);
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

    const handleCheckout = async () => {
        if (cart.length === 0) return alert(t('cart.alerts.empty'));
        if (!email) return alert(t('cart.alerts.no_email'));

        try {
            const orderRequest = {
                userId: parseInt(userId),
                status: 'CREATED',
                totalPrice: calculateTotal(),
                email: email
            };
            
            const orderResponse = await api.post('/orders/createorder', orderRequest);
            const newOrderId = orderResponse.data.id;

            const orderItemsPromises = cart.map(item => {
                const orderItemReq = {
                    orderId: newOrderId,
                    itemId: item.id,
                    quantity: item.quantity
                };
                return api.post('/orders/orderitems', orderItemReq);
            });

            await Promise.all(orderItemsPromises);

            localStorage.removeItem('cart');
            alert(t('cart.alerts.success'));
            navigate('/orders');

        } catch (error) {
            console.error(t('cart.errors.checkout'), error);
            alert(t('cart.alerts.error'));
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2 className="mb-4">{t('cart.title')}</h2>
                
                {cart.length === 0 ? (
                    <div className="alert alert-secondary">
                        {t('cart.empty_msg')} <a href="/shop">{t('cart.go_to_shop')}</a>
                    </div>
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
                                                <i className="bi bi-trash"></i> {t('cart.remove')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="d-flex justify-content-between align-items-end p-3 bg-light rounded">
                                <div>
                                    <label className="form-label small text-muted mb-1">{t('cart.email_label')}</label>
                                    <input type="email" className="form-control form-control-sm" 
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="text-end">
                                    <h5 className="mb-1">{t('cart.total')}: <span className="text-primary fw-bold">{calculateTotal()} $</span></h5>
                                    <button className="btn btn-success mt-2" onClick={handleCheckout}>
                                        {t('cart.checkout_btn')}
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