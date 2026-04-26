import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next'; // <-- Импорт хука

export default function Orders() {
    const { t } = useTranslation(); // <-- Инициализация
    const [orders, setOrders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null); 
    
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
            console.error('Fetch orders error', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenCreate = () => {
        setFormData({ email: '', status: 'CREATED', totalPrice: 0 });
        setEditingOrderId(null);
        setShowForm(true);
    };

    const handleOpenEdit = (order) => {
        setFormData({ email: order.email, status: order.status, totalPrice: order.totalPrice });
        setEditingOrderId(order.id);
        setShowForm(true);
    };

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
                await api.put(`/orders/${editingOrderId}`, orderRequest);
                alert(t('orders.alerts.update_success'));
            } else {
                await api.post('/orders/createorder', orderRequest);
                alert(t('orders.alerts.create_success'));
            }
            
            setShowForm(false);
            fetchOrders(); 
        } catch (error) {
            console.error('Save order error', error);
            alert(t('orders.errors.save_failed'));
        }
    };

    const handlePay = async (orderId, totalPrice) => {
        try {
            await api.post('/payments', { orderId: String(orderId), userId: String(userId), paymentAmount: totalPrice });
            alert(t('orders.alerts.pay_success'));
            fetchOrders(); 
        } catch (error) {
            console.error('Payment error', error);
            alert(t('orders.errors.pay_failed'));
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm(t('orders.alerts.delete_confirm'))) {
            try {
                await api.delete(`/orders/${orderId}`);
                fetchOrders(); 
            } catch (error) {
                console.error('Delete error', error);
                alert(t('orders.errors.delete_failed'));
            }
        }
    };

    return (
        <div>
            <h2 className="mb-4">{t('orders.title')}</h2>
            <button className={`btn mb-4 ${showForm && !editingOrderId ? 'btn-secondary' : 'btn-success'}`} onClick={handleOpenCreate}>
                {showForm && !editingOrderId ? t('orders.btn.cancel_create') : t('orders.btn.create_order')}
            </button>

            {showForm && (
                <div className="card shadow-sm mb-4 border-primary">
                    <div className="card-body">
                        <h5 className="card-title">
                            {editingOrderId ? t('orders.form.edit_title', { id: editingOrderId }) : t('orders.form.new_title')}
                        </h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">{t('orders.form.email')}</label>
                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">{t('orders.form.amount')}</label>
                                <input type="number" step="0.01" min="0" name="totalPrice" className="form-control" value={formData.totalPrice} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">{t('orders.form.status')}</label>
                                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                                    <option value="CREATED">CREATED</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="PAID">PAID</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary me-2">{t('orders.form.save')}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('orders.form.cancel')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {orders.length === 0 ? (
                <div className="alert alert-info">{t('orders.empty')}</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
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
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.email}</td>
                                    <td><span className={`badge ${order.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span></td>
                                    <td><strong>{order.totalPrice}</strong></td>
                                    <td>
                                        {order.status !== 'PAID' && (
                                            <button onClick={() => handlePay(order.id, order.totalPrice)} className="btn btn-sm btn-success me-2">{t('orders.btn.pay')}</button>
                                        )}
                                        <button onClick={() => handleOpenEdit(order)} className="btn btn-sm btn-primary me-2">{t('orders.btn.edit')}</button>
                                        <button onClick={() => handleDelete(order.id)} className="btn btn-sm btn-danger">{t('orders.btn.delete')}</button>
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