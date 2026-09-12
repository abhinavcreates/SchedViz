import React, { useState } from 'react';
import ProcessForm from '../components/ProcessForm';
import GanttChart from '../components/GanttChart';
import ProcessTable from '../components/ProcessTable';
import { useSimulate } from '../hooks/useSimulate';

const ALGORITHMS = [
  { id: 'fcfs', label: 'FCFS', desc: 'First Come First Serve: Processes are scheduled in the order they arrive. Simple but can cause long waiting times (convoy effect).' },
  { id: 'sjf', label: 'SJF', desc: 'Shortest Job First: Always runs the available process with the shortest burst time next. Optimal for average waiting time, but risks starvation.' },
  { id: 'srtf', label: 'SRTF', desc: 'Shortest Remaining Time First: Preemptive SJF — if a new process arrives with a shorter remaining time than the current process, it preempts immediately.' },
  { id: 'rr', label: 'Round Robin', desc: 'Each process gets equal CPU time slices (quantum). Fair and widely used in time-sharing systems. Quantum size affects performance.' },
  { id: 'priority_np', label: 'Priority (NP)', desc: 'Priority Non-Preemptive: Runs the highest-priority (lowest number) available process. Runs until completion.' },
  { id: 'priority_p', label: 'Priority (P)', desc: 'Priority Preemptive: A higher-priority arriving process immediately preempts the current one.' }
];

export default function CPUScheduling() {
  const [selectedAlgo, setSelectedAlgo] = useState(ALGORITHMS[0].id);
  const { result, loading, error, simulate } = useSimulate('/simulate/cpu');

  const handleSimulate = async (data) => {
    await simulate({
      algorithm: selectedAlgo,
      processes: data.processes,
      quantum: data.quantum
    });
  };

  const activeAlgoDesc = ALGORITHMS.find(a => a.id === selectedAlgo)?.desc;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-mono text-white">CPU Scheduling Simulator</h1>
        
        {/* Algorithm Selector */}
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map(algo => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgo(algo.id)}
              className={`px-4 py-2 text-sm font-medium border border-border transition-colors ${
                selectedAlgo === algo.id 
                  ? 'bg-accent text-base border-accent' 
                  : 'bg-surface text-text-primary hover:border-text-muted'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-text-muted max-w-3xl">{activeAlgoDesc}</p>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8 mt-4">
        {/* Left Column: Form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-white border-b border-border pb-2">Input</h2>
          <ProcessForm algorithm={selectedAlgo} onSubmit={handleSimulate} loading={loading} />
          {error && <div className="p-3 bg-error/10 text-error border border-error/20 text-sm">{error}</div>}
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-8">
          <h2 className="text-lg font-medium text-white border-b border-border pb-2">Simulation Results</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-48 border border-border bg-surface text-text-muted">
              Running simulation...
            </div>
          ) : result ? (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-text-muted uppercase tracking-wider">Gantt Chart</h3>
                <GanttChart timeline={result.timeline} totalTime={Math.max(...result.timeline.map(s => s.end))} />
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-text-muted uppercase tracking-wider">Process Metrics</h3>
                <ProcessTable 
                  processes={result.processes} 
                  avgTurnaround={result.avgTurnaround} 
                  avgWaiting={result.avgWaiting} 
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 border border-border bg-surface text-text-muted text-sm">
              Enter process data and run simulation to see results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
