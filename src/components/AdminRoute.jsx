import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        console.log("Токен админа:", decoded); // Оставил для дебага
        
        const roleField = decoded.role || decoded.roles || decoded.authorities || '';
        const roleString = JSON.stringify(roleField).toUpperCase();
        
        if (roleString.includes('ADMIN')) {
            return children;
        }

        // Тихий редирект без alert, чтобы не вешать браузер
        return <Navigate to="/orders" replace />;
        
    } catch (error) {
        console.error("Ошибка проверки прав:", error);
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;