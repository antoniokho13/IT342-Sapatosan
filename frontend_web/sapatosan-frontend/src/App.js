import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Basketball from './pages/Basketball';
import Casual from './pages/Casual';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/basketball" element={<Basketball />} />
          <Route path="/casual" element={<Casual />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;