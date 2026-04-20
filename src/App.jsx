import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // <-- Убедись, что импортировал!

import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Обычные защищенные маршруты */}
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* СТРОГИЙ МАРШРУТ ДЛЯ АДМИНА */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/orders" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;