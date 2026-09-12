import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/history');
      setHistory(res.data);
    } catch (err) {
      setError('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
    else setLoading(false);
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (item) => {
    // Navigate with state so the destination page could theoretically load it
    // Note: To fully support this, the target pages would need to read from location.state
    if (item.module === 'cpu') navigate('/cpu', { state: { result: item.result, params: item.parameters } });
    else navigate('/memory', { state: { result: item.result, params: item.parameters } });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="text-xl text-text-primary">Log in to view your simulation history</div>
        <Link to="/login" className="px-6 py-2 bg-accent text-base font-medium hover:bg-accent-hover transition-colors">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-mono text-white border-b border-border pb-4">Simulation History</h1>
      
      {loading ? (
        <div className="text-text-muted">Loading history...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : history.length === 0 ? (
        <div className="p-8 border border-border bg-surface text-center text-text-muted">
          No history found. Run some simulations first!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map(item => (
            <div key={item.id} className="p-4 border border-border bg-surface flex justify-between items-center group relative">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 font-bold uppercase tracking-wider ${
                    item.module === 'cpu' ? 'bg-[#c94f4f]/20 text-[#c94f4f]' : 'bg-[#5b7fa6]/20 text-[#5b7fa6]'
                  }`}>
                    {item.module}
                  </span>
                  <span className="font-mono text-white text-lg">{item.algorithm.toUpperCase()}</span>
                  <span className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-sm text-text-muted">
                  {item.module === 'cpu' ? (
                    `Avg WT: ${item.result?.avgWaiting?.toFixed(2)}ms | Avg TAT: ${item.result?.avgTurnaround?.toFixed(2)}ms | ${item.parameters?.processes?.length} processes`
                  ) : (
                    item.algorithm.includes('fit') 
                      ? `${item.parameters?.blocks?.length} blocks | ${item.parameters?.processes?.length} processes` 
                      : `${item.parameters?.frames} frames | ${item.result?.steps?.filter(s=>s.fault).length} faults`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleView(item)}
                  className="px-4 py-1.5 border border-accent text-accent hover:bg-accent hover:text-base transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>

              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
