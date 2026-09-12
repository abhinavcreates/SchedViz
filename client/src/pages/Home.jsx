import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto">
      <h1 className="text-5xl font-mono font-bold text-accent mb-4 tracking-tight">SchedViz</h1>
      <h2 className="text-xl text-text-primary mb-6 font-medium">CPU Scheduling & Memory Management Simulator</h2>
      <p className="text-text-muted mb-12 max-w-2xl text-lg leading-relaxed">
        Interactive visualization tool for operating system concepts. Analyze, compare, and understand scheduling algorithms and memory management techniques with animated visual feedback.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full mb-12">
        <Link 
          to="/cpu" 
          className="group flex flex-col p-8 bg-surface border border-border hover:border-accent transition-colors"
        >
          <div className="text-2xl font-medium text-white mb-2 group-hover:text-accent transition-colors">CPU Scheduling</div>
          <div className="text-text-muted text-sm mb-6 flex-1">
            Simulate process execution and view animated Gantt charts.
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-text-muted">
            <span className="px-2 py-1 bg-base border border-border">FCFS</span>
            <span className="px-2 py-1 bg-base border border-border">SJF</span>
            <span className="px-2 py-1 bg-base border border-border">SRTF</span>
            <span className="px-2 py-1 bg-base border border-border">RR</span>
            <span className="px-2 py-1 bg-base border border-border">Priority</span>
          </div>
        </Link>

        <Link 
          to="/memory" 
          className="group flex flex-col p-8 bg-surface border border-border hover:border-accent transition-colors"
        >
          <div className="text-2xl font-medium text-white mb-2 group-hover:text-accent transition-colors">Memory Management</div>
          <div className="text-text-muted text-sm mb-6 flex-1">
            Visualize memory allocation blocks and page replacement steps.
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-text-muted">
            <span className="px-2 py-1 bg-base border border-border">First/Best/Worst Fit</span>
            <span className="px-2 py-1 bg-base border border-border">FIFO/LRU/Optimal</span>
          </div>
        </Link>
      </div>

      <p className="text-sm text-text-muted">
        <Link to="/login" className="text-accent hover:underline">Log in</Link> to save your simulation history.
      </p>
    </div>
  );
}
