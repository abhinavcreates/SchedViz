import React from 'react';
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {Array} props.processes - metrics per process
 * @param {number} props.avgTurnaround
 * @param {number} props.avgWaiting
 */
export default function ProcessTable({ processes, avgTurnaround, avgWaiting }) {
  if (!processes || processes.length === 0) return null;

  return (
    <div className="w-full mt-6">
      <div className="border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-accent">
            <tr>
              <th className="p-3 border-b border-border">Process</th>
              <th className="p-3 border-b border-border">Arrival</th>
              <th className="p-3 border-b border-border">Burst</th>
              <th className="p-3 border-b border-border">Completion</th>
              <th className="p-3 border-b border-border">Turnaround</th>
              <th className="p-3 border-b border-border">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, idx) => (
              <motion.tr 
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-b border-border last:border-0 odd:bg-base even:bg-[#1e1e1e]"
              >
                <td className="p-3 font-mono text-white">{p.id}</td>
                <td className="p-3 font-mono">{p.arrival}</td>
                <td className="p-3 font-mono">{p.burst}</td>
                <td className="p-3 font-mono">{p.completion}</td>
                <td className="p-3 font-mono">{p.turnaround}</td>
                <td className="p-3 font-mono">{p.waiting}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end gap-6 mt-4 p-3 border border-border bg-surface text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-text-muted">Avg Turnaround Time:</span>
          <span className="font-mono text-accent font-bold">{avgTurnaround.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-text-muted">Avg Waiting Time:</span>
          <span className="font-mono text-accent font-bold">{avgWaiting.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
