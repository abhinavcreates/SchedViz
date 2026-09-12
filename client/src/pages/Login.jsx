import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/cpu');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-base border border-border text-text-primary font-mono px-3 py-2 w-full focus:outline-none focus:border-accent";

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 border border-border bg-surface">
      <h1 className="text-2xl font-mono text-white mb-6">Login</h1>
      
      {error && <div className="mb-4 p-2 bg-error/10 border border-error/30 text-error text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 py-2 bg-accent hover:bg-accent-hover text-base font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-border text-sm text-text-muted text-center">
        Don't have an account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
