import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function Shop() {
    const [items, setItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchItems();
        updateCartCount();
    }, []);

    // Используем твой новый метод!
    const fetchItems = async () => {
        try {
            const response = await api.get('/orders/items');
            setItems(response.data);
        } catch (error) {
            console.error('Ошибка загрузки товаров', error);
        }
    };

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    const addToCart = (item) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        // Небольшое визуальное подтверждение
        alert(`Товар "${item.name}" добавлен в корзину!`);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Каталог товаров</h2>
                <a href="/cart" className="btn btn-warning fw-bold">
                    🛒 Корзина <span className="badge bg-danger ms-1">{cartCount}</span>
                </a>
            </div>

            {items.length === 0 ? (
                <div className="alert alert-info">Товаров пока нет. (Администратору нужно их добавить через POST /items/create)</div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {items.map(item => (
                        <div className="col" key={item.id}>
                            <div className="card h-100 shadow-sm border-0 bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title fw-bold">{item.name}</h5>
                                    <h4 className="text-success mb-3">{item.price} $</h4>
                                    <button 
                                        className="btn btn-primary w-100"
                                        onClick={() => addToCart(item)}
                                    >
                                        Добавить в корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}