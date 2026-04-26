import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next'; // <-- Импорт хука

export default function AdminPanel() {
    const { t } = useTranslation(); // <-- Инициализация
    const [usersPage, setUsersPage] = useState({ content: [], totalPages: 0 });
    const [userPageNum, setUserPageNum] = useState(0);

    const [ordersPage, setOrdersPage] = useState({ content: [], totalPages: 0 });
    const [filters, setFilters] = useState({ status: '', from: '', to: '' });

    const [globalSum, setGlobalSum] = useState(0);

    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', price: '' });

    useEffect(() => {
        fetchUsers(userPageNum);
        fetchGlobalSum();
        fetchFilteredOrders();
        fetchItems();
    }, [userPageNum]);

    const fetchUsers = async (page) => {
        try {
            const response = await api.get(`/users?page=${page}&size=5`);
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setUsersPage(data);
        } catch (error) {
            console.error('Fetch users error', error);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus) {
                await api.patch(`/users/deactivate/${userId}`);
            } else {
                await api.patch(`/users/activate/${userId}`);
            }
            fetchUsers(userPageNum); 
        } catch (error) {
            console.error('Toggle status error', error);
        }
    };

    const fetchFilteredOrders = async () => {
        try {
            const fromDate = filters.from ? `${filters.from}T00:00:00` : '2000-01-01T00:00:00';
            const toDate = filters.to ? `${filters.to}T23:59:59` : '2099-12-31T23:59:59';
            const statusParam = filters.status ? filters.status : '';

            const query = `/orders?page=0&size=50&from=${fromDate}&to=${toDate}&status=${statusParam}`;
            const response = await api.get(query);
            
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setOrdersPage(data);
        } catch (error) {
            console.error('Search orders error', error);
        }
    };

    const fetchGlobalSum = async () => {
        try {
            const response = await api.get('/payments/sum', {
                params: { from: '2000-01-01T00:00:00Z', to: '2099-12-31T23:59:59Z' }
            });
            setGlobalSum(response.data);
        } catch (error) {
            console.error('Fetch global sum error', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await api.get('/orders/items');
            setItems(response.data);
        } catch (error) {
            console.error('Fetch items error', error);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders/items/create', {
                name: newItem.name,
                price: parseFloat(newItem.price)
            });
            alert(t('admin.alerts.item_added'));
            setNewItem({ name: '', price: '' }); 
            fetchItems(); 
        } catch (error) {
            console.error('Create item error', error);
            alert(t('admin.alerts.item_add_error'));
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm(t('admin.alerts.item_del_confirm'))) {
            try {
                await api.delete(`/orders/items/${id}`);
                fetchItems();
            } catch (error) {
                console.error('Delete item error', error);
                alert(t('admin.alerts.item_del_error'));
            }
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4 text-danger border-bottom pb-2">{t('admin.title')}</h2>

            <div className="row">
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">{t('admin.users_mgmt')}</h5>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>{t('admin.table.id')}</th>
                                        <th>{t('admin.table.email')}</th>
                                        <th>{t('admin.table.name')}</th>
                                        <th>{t('admin.table.status')}</th>
                                        <th>{t('admin.table.action')}</th>
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
                                                    {u.active ? t('admin.status.active') : t('admin.status.banned')}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                    onClick={() => toggleUserStatus(u.id, u.active)}
                                                >
                                                    {u.active ? t('admin.status.block') : t('admin.status.unblock')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum === 0} 
                                    onClick={() => setUserPageNum(userPageNum - 1)}>{t('admin.pagination.prev')}</button>
                                <span>{t('admin.pagination.page', { current: userPageNum + 1, total: usersPage.totalPages || 1 })}</span>
                                <button className="btn btn-sm btn-secondary" 
                                    disabled={userPageNum >= (usersPage.totalPages - 1)} 
                                    onClick={() => setUserPageNum(userPageNum + 1)}>{t('admin.pagination.next')}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm mb-4 border-success">
                        <div className="card-body text-center bg-success text-white rounded">
                            <h4>{t('admin.revenue.title')}</h4>
                            <h2 className="display-5 fw-bold">{globalSum} $</h2>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{t('admin.orders.title')}</h5>
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
                                        <option value="">{t('admin.orders.all_statuses')}</option>
                                        <option value="CREATED">CREATED</option>
                                        <option value="PAID">PAID</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-sm btn-primary w-100" onClick={fetchFilteredOrders}>
                                        {t('admin.orders.search_btn')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <ul className="list-group list-group-flush">
                                    {ordersPage.content?.map(order => (
                                        <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{t('admin.orders.order_number', { id: order.id })}</strong> <small className="text-muted">({order.email})</small>
                                            </div>
                                            <div>
                                                <span className="me-3 fw-bold">{order.totalPrice} $</span>
                                                <span className="badge bg-secondary">{order.status}</span>
                                            </div>
                                        </li>
                                    ))}
                                    {ordersPage.content?.length === 0 && <small className="text-muted">{t('admin.orders.not_found')}</small>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card shadow-sm border-warning">
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">{t('admin.catalog.title')}</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 border-end">
                                    <h6 className="mb-3">{t('admin.catalog.add_new')}</h6>
                                    <form onSubmit={handleCreateItem}>
                                        <div className="mb-2">
                                            <label className="form-label small">{t('admin.catalog.name_label')}</label>
                                            <input type="text" className="form-control form-control-sm" required
                                                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} 
                                                placeholder={t('admin.catalog.name_placeholder')} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small">{t('admin.catalog.price_label')}</label>
                                            <input type="number" step="0.01" min="0" className="form-control form-control-sm" required
                                                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} 
                                                placeholder="999.99" />
                                        </div>
                                        <button type="submit" className="btn btn-sm btn-success w-100">{t('admin.catalog.add_btn')}</button>
                                    </form>
                                </div>
                                
                                <div className="col-md-8">
                                    <h6 className="mb-3">{t('admin.catalog.current_items')}</h6>
                                    {items.length === 0 ? (
                                        <div className="alert alert-secondary py-2">{t('admin.catalog.empty')}</div>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-hover align-middle">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>{t('admin.table.id')}</th>
                                                        <th>{t('admin.catalog.table.name')}</th>
                                                        <th>{t('admin.catalog.table.price')}</th>
                                                        <th className="text-end">{t('admin.table.action')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="text-muted small">{item.id}</td>
                                                            <td className="fw-bold">{item.name}</td>
                                                            <td className="text-success fw-bold">{item.price} $</td>
                                                            <td className="text-end">
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i> {t('admin.catalog.delete_btn')}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}