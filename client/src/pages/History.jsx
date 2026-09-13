import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

/**
 * History page — shows the authenticated user's last 5 simulations.
 *
 * Mobile responsiveness:
 *   - Cards use flex-col on mobile, flex-row on sm+
 *   - Long algorithm names truncate with title attribute for full text on hover
 *   - Delete button always visible (not hover-only) so it's accessible on touch
 *   - "View Details" button always uses full text, never truncated
 *
 * Note on IDs: Mongoose returns _id (not id), so we use item._id throughout.
 */
export default function History() {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');
  const [deleting, setDeleting] = useState(null); // id currently being deleted

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/history');
      setHistory(res.data);
    } catch {
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
    setDeleting(id);
    try {
      await apiClient.delete(`/history/${id}`);
      // Use _id for comparison since Mongoose returns _id
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('[SchedViz] Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (item) => {
    // Navigate to the appropriate simulator page with the stored result in state.
    // The target pages check location.state on mount to pre-populate results.
    if (item.module === 'cpu') {
      navigate('/cpu', { state: { result: item.result, input: item.input } });
    } else {
      navigate('/memory', { state: { result: item.result, input: item.input } });
    }
  };

  // ── Human-readable labels ──────────────────────────────────────────────────
  const MODULE_LABELS = { cpu: 'CPU', memory: 'Memory', page: 'Page Replacement' };
  const ALGO_LABELS   = {
    fcfs: 'FCFS', sjf: 'SJF', srtf: 'SRTF', rr: 'Round Robin',
    priority_np: 'Priority (NP)', priority_p: 'Priority (P)',
    firstfit: 'First Fit', bestfit: 'Best Fit', worstfit: 'Worst Fit',
    fifo: 'FIFO', lru: 'LRU', optimal: 'Optimal',
  };

  const getSummary = (item) => {
    if (item.module === 'cpu') {
      const procs = item.input?.processes?.length ?? '?';
      const avgWT = item.result?.avgWaiting?.toFixed(2) ?? '—';
      const avgTAT = item.result?.avgTurnaround?.toFixed(2) ?? '—';
      return `${procs} processes | Avg WT: ${avgWT}ms | Avg TAT: ${avgTAT}ms`;
    }
    if (item.module === 'memory') {
      const blocks = item.input?.blocks?.length ?? '?';
      const procs  = item.input?.processes?.length ?? '?';
      return `${blocks} blocks | ${procs} processes`;
    }
    if (item.module === 'page') {
      const frames = item.input?.frames ?? '?';
      const faults = item.result?.totalFaults ?? '?';
      return `${frames} frames | ${faults} page faults`;
    }
    return '';
  };

  // ── Unauthenticated state ─────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-4">
        <div className="text-xl text-text-primary">Log in to view your simulation history</div>
        <Link
          to="/login"
          className="px-6 py-3 bg-accent text-base font-medium hover:bg-accent-hover transition-colors min-h-[44px] flex items-center"
        >
          Login
        </Link>
      </div>
    );
  }

  // ── Main history view ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-2 sm:px-0">
      <h1 className="text-2xl font-mono text-white border-b border-border pb-4">
        Simulation History
      </h1>

      {loading ? (
        <div className="text-text-muted">Loading history...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : history.length === 0 ? (
        <div className="p-8 border border-border bg-surface text-center text-text-muted">
          No history found. Run some simulations first!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <div
              key={item._id}
              className="border border-border bg-surface p-4"
            >
              {/* ── Card header: badges + timestamp ─────────────────────── */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Module badge */}
                <span
                  className={`text-[11px] px-2 py-0.5 font-bold uppercase tracking-wider shrink-0 ${
                    item.module === 'cpu'
                      ? 'bg-[#c94f4f]/20 text-[#c94f4f]'
                      : item.module === 'memory'
                      ? 'bg-teal/10 text-teal'
                      : 'bg-[#5b7fa6]/20 text-[#5b7fa6]'
                  }`}
                >
                  {MODULE_LABELS[item.module] ?? item.module}
                </span>

                {/* Algorithm name */}
                <span className="font-mono text-white font-medium text-sm sm:text-base">
                  {ALGO_LABELS[item.algorithm] ?? item.algorithm.toUpperCase()}
                </span>

                {/* Timestamp — pushed right on sm+, wraps below on xs */}
                <span className="text-xs text-text-muted sm:ml-auto">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              {/* ── Summary line ─────────────────────────────────────────── */}
              <div className="text-sm text-text-muted mb-4 font-mono break-all sm:break-normal">
                {getSummary(item)}
              </div>

              {/* ── Action buttons ───────────────────────────────────────── */}
              {/* On mobile: full-width stacked; on sm+: side by side */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-base transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deleting === item._id}
                  className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 border border-border text-error hover:border-error hover:bg-error/10 transition-colors text-sm disabled:opacity-50"
                >
                  {deleting === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
