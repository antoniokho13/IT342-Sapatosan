import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCategories from './pages/AdminCategories';
import AdminOrder from './pages/AdminOrder';
import AdminProduct from './pages/AdminProduct';
import AdminUsers from './pages/AdminUsers';
import Basketball from './pages/Basketball';
import Casual from './pages/Casual';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Running from './pages/Running';
import UserInformation from './pages/UserInformation';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/basketball" element={<Basketball />} />
          <Route path="/casual" element={<Casual />} />
          <Route path="/running" element={<Running />} />
          <Route path="/profile" element={<UserInformation />} />
          <Route path="/checkout" element={<Checkout />} />

          
          {/* Admin Routes */}
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrder />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;