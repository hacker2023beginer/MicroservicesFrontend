import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            fetchPayments();
            fetchTotalSum();
        }
    }, [userId]);

    const fetchPayments = async () => {
        try {
            // ВНИМАНИЕ: Тебе нужно создать этот GET-метод в PaymentServiceController
            // Возвращающий список (List<PaymentResponse>) по userId
            const response = await api.get(`/payments/user/${userId}`);
            setPayments(response.data);
        } catch (error) {
            console.error('Не удалось загрузить список платежей');
        }
    };

    const fetchTotalSum = async () => {
        try {
            // Твой метод требует параметры from и to. 
            // Подставляем примерные даты для теста:
            const response = await api.get('/payments/sum/user', {
                params: { 
                    userId: userId, 
                    from: '2000-01-01', 
                    to: '2099-12-31' 
                }
            });
            setTotalSum(response.data);
        } catch (error) {
            console.error('Не удалось загрузить сумму платежей');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Мои платежи</h2>
                <span className="badge bg-primary fs-5">
                    Всего оплачено: {totalSum} $
                </span>
            </div>

            {payments.length === 0 ? (
                <div className="alert alert-info">У вас пока нет проведенных платежей.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID Платежа</th>
                                <th>ID Заказа</th>
                                <th>Сумма</th>
                                <th>Дата</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>{payment.orderId}</td>
                                    <td><strong>{payment.amount}</strong></td>
                                    {/* Форматируем дату, если она приходит в ISO формате */}
                                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge bg-success">Успешно</span>
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