import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId && userId !== 'null' && userId !== 'undefined') {
            fetchPayments();
            fetchTotalSum();
        }
    }, [userId]);

    // ИСПОЛЬЗУЕМ ТВОЙ НОВЫЙ МЕТОД: GET /payments?userId={id}
    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments', {
                params: { userId: userId }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Не удалось загрузить историю платежей', error);
        }
    };

    const fetchTotalSum = async () => {
        try {
            const response = await api.get('/payments/sum/user', {
                params: { 
                    userId: userId, 
                    from: '2000-01-01T00:00:00Z', // <-- Вернули 'Z' для Instant
                    to: '2099-12-31T23:59:59Z'    // <-- Вернули 'Z' для Instant
                }
            });
            setTotalSum(response.data);
        } catch (error) {
            console.error('Не удалось загрузить сумму платежей', error);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Мои платежи</h2>
                <span className="badge bg-success fs-5 shadow-sm">
                    Всего оплачено: {totalSum} $
                </span>
            </div>

            {payments.length === 0 ? (
                <div className="alert alert-info">У вас пока нет проведенных платежей.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>ID Платежа</th>
                                <th>Заказ №</th>
                                <th>Сумма</th>
                                <th>Дата</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="text-muted small">{payment.id}</td>
                                    <td className="fw-bold">{payment.orderId}</td>
                                    <td><strong>{payment.paymentAmount} $</strong></td>
                                    <td>{payment.timestamp ? new Date(payment.timestamp).toLocaleString() : '-'}</td>
                                    <td>
                                        <span className={`badge ${payment.status === 'SUCCESS' || payment.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {payment.status}
                                        </span>
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