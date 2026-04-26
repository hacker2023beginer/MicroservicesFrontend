import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next'; // <-- Импорт хука

export default function Payments() {
    const { t } = useTranslation(); // <-- Инициализация
    const [payments, setPayments] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId && userId !== 'null' && userId !== 'undefined') {
            fetchPayments();
            fetchTotalSum();
        }
    }, [userId]);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments', {
                params: { userId: userId }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Fetch payments error', error);
        }
    };

    const fetchTotalSum = async () => {
        try {
            const response = await api.get('/payments/sum/user', {
                params: { 
                    userId: userId, 
                    from: '2000-01-01T00:00:00Z',
                    to: '2099-12-31T23:59:59Z'
                }
            });
            setTotalSum(response.data);
        } catch (error) {
            console.error('Fetch total sum error', error);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{t('payments.title')}</h2>
                <span className="badge bg-success fs-5 shadow-sm">
                    {t('payments.total_paid')} {totalSum} $
                </span>
            </div>

            {payments.length === 0 ? (
                <div className="alert alert-info">{t('payments.empty')}</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>{t('payments.table.id')}</th>
                                <th>{t('payments.table.order_id')}</th>
                                <th>{t('payments.table.amount')}</th>
                                <th>{t('payments.table.date')}</th>
                                <th>{t('payments.table.status')}</th>
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