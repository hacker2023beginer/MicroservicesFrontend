import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next'; // <-- Импорт хука

const AdminRoute = ({ children }) => {
    const { t } = useTranslation(); // <-- Инициализация
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        console.log(t('adminRoute.logs.token'), decoded); 
        
        const roleField = decoded.role || decoded.roles || decoded.authorities || '';
        const roleString = JSON.stringify(roleField).toUpperCase();
        
        if (roleString.includes('ADMIN')) {
            return children;
        }

        // Тихий редирект
        return <Navigate to="/orders" replace />;
        
    } catch (error) {
        console.error(t('adminRoute.errors.permission'), error);
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;