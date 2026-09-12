import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CPUScheduling from './pages/CPUScheduling';
import MemoryManagement from './pages/MemoryManagement';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cpu" element={<CPUScheduling />} />
          <Route path="/memory" element={<MemoryManagement />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}
