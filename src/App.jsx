import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Navbar from './components/Navbar'; // Простой компонент с меню Bootstrap

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Защищенные маршруты */}
          <Route path="/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute><Payments /></ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/orders" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;