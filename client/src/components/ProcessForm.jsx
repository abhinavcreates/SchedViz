import React, { useState, useEffect } from 'react';

/**
 * @param {Object} props
 * @param {string} props.algorithm - currently selected algorithm (fcfs, sjf, rr, priority_np, etc)
 * @param {Function} props.onSubmit - callback with { processes, quantum? }
 * @param {boolean} props.loading - if true, disables inputs and button
 */
export default function ProcessForm({ algorithm, onSubmit, loading }) {
  const [processes, setProcesses] = useState([
    { id: 'P1', arrival: '0', burst: '5', priority: '1' }
  ]);
  const [quantum, setQuantum] = useState('2');
  const [error, setError] = useState('');

  const isPriority = algorithm.startsWith('priority');
  const isRR = algorithm === 'rr';

  // Handle input change
  const handleChange = (index, field, value) => {
    const newProcs = [...processes];
    newProcs[index][field] = value;
    setProcesses(newProcs);
    setError('');
  };

  const handleAdd = () => {
    setProcesses([
      ...processes,
      { id: `P${processes.length + 1}`, arrival: '0', burst: '1', priority: '1' }
    ]);
  };

  const handleRemove = (index) => {
    if (processes.length === 1) return;
    const newProcs = processes.filter((_, i) => i !== index);
    // Reassign IDs to be sequential
    const updated = newProcs.map((p, i) => ({ ...p, id: `P${i + 1}` }));
    setProcesses(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    for (let i = 0; i < processes.length; i++) {
      const p = processes[i];
      if (parseInt(p.arrival) < 0 || isNaN(parseInt(p.arrival))) return setError(`Invalid arrival time for ${p.id}`);
      if (parseInt(p.burst) <= 0 || isNaN(parseInt(p.burst))) return setError(`Burst time for ${p.id} must be > 0`);
      if (isPriority && (parseInt(p.priority) < 0 || isNaN(parseInt(p.priority)))) return setError(`Invalid priority for ${p.id}`);
    }

    if (isRR && (parseInt(quantum) <= 0 || isNaN(parseInt(quantum)))) {
      return setError('Time quantum must be > 0');
    }

    onSubmit({
      processes: processes.map(p => ({
        id: p.id,
        arrival: parseInt(p.arrival),
        burst: parseInt(p.burst),
        priority: isPriority ? parseInt(p.priority) : 0
      })),
      quantum: isRR ? parseInt(quantum) : undefined
    });
  };

  const inputClass = "bg-surface border border-border text-text-primary font-mono px-3 py-2 focus:outline-none focus:border-accent w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isRR && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Time Quantum:</label>
          <input
            type="number"
            min="1"
            value={quantum}
            onChange={(e) => setQuantum(e.target.value)}
            disabled={loading}
            className={`${inputClass} max-w-[100px]`}
          />
        </div>
      )}

      {error && <div className="text-error text-sm">{error}</div>}

      <div className="border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-accent">
            <tr>
              <th className="p-2 border-b border-border">Process ID</th>
              <th className="p-2 border-b border-border">Arrival Time</th>
              <th className="p-2 border-b border-border">Burst Time</th>
              {isPriority && <th className="p-2 border-b border-border">Priority</th>}
              <th className="p-2 border-b border-border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, idx) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-2 font-mono">{p.id}</td>
                <td className="p-2">
                  <input type="number" min="0" value={p.arrival} onChange={(e) => handleChange(idx, 'arrival', e.target.value)} disabled={loading} className={inputClass} />
                </td>
                <td className="p-2">
                  <input type="number" min="1" value={p.burst} onChange={(e) => handleChange(idx, 'burst', e.target.value)} disabled={loading} className={inputClass} />
                </td>
                {isPriority && (
                  <td className="p-2">
                    <input type="number" min="0" value={p.priority} onChange={(e) => handleChange(idx, 'priority', e.target.value)} disabled={loading} className={inputClass} />
                  </td>
                )}
                <td className="p-2 text-center">
                  <button type="button" onClick={() => handleRemove(idx)} disabled={loading || processes.length === 1} className="text-error hover:text-red-400 disabled:opacity-50">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="flex-1 py-2 border border-border bg-surface hover:border-accent disabled:opacity-50 transition-colors text-sm"
        >
          + Add Process
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-accent hover:bg-accent-hover text-base font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>
    </form>
  );
}
