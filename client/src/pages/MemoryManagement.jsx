import React, { useState } from 'react';
import MemoryBlocks from '../components/MemoryBlocks';
import FrameTable from '../components/FrameTable';
import { useSimulate } from '../hooks/useSimulate';

const ALLOC_ALGOS = [
  { id: 'firstfit', label: 'First Fit' },
  { id: 'bestfit', label: 'Best Fit' },
  { id: 'worstfit', label: 'Worst Fit' }
];

const PAGE_ALGOS = [
  { id: 'fifo', label: 'FIFO' },
  { id: 'lru', label: 'LRU' },
  { id: 'optimal', label: 'Optimal' }
];

export default function MemoryManagement() {
  const [activeTab, setActiveTab] = useState('alloc'); // 'alloc' | 'page'
  
  // States for Allocation
  const [allocAlgo, setAllocAlgo] = useState(ALLOC_ALGOS[0].id);
  const [blockSizes, setBlockSizes] = useState('100, 500, 200, 300, 600');
  const [processSizes, setProcessSizes] = useState('212, 417, 112, 426');
  
  // States for Paging
  const [pageAlgo, setPageAlgo] = useState(PAGE_ALGOS[0].id);
  const [numFrames, setNumFrames] = useState('3');
  const [refString, setRefString] = useState('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');

  const { result: allocResult, loading: allocLoading, error: allocError, simulate: simAlloc, reset: resetAlloc } = useSimulate('/simulate/memory');
  const { result: pageResult, loading: pageLoading, error: pageError, simulate: simPage, reset: resetPage } = useSimulate('/simulate/page');

  const handleSimulateAlloc = async (e) => {
    e.preventDefault();
    const bSizes = blockSizes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const pSizes = processSizes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (bSizes.length === 0 || pSizes.length === 0) return;
    
    await simAlloc({
      algorithm: allocAlgo,
      blocks: bSizes,
      processes: pSizes.map((size, i) => ({ id: `P${i+1}`, size }))
    });
  };

  const handleSimulatePage = async (e) => {
    e.preventDefault();
    const refs = refString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const frames = parseInt(numFrames);
    if (refs.length === 0 || isNaN(frames) || frames <= 0) return;

    await simPage({
      algorithm: pageAlgo,
      frames,
      referenceString: refs
    });
  };

  const inputClass = "bg-surface border border-border text-text-primary font-mono px-3 py-2 focus:outline-none focus:border-accent w-full";
  const btnClass = "py-2 bg-accent hover:bg-accent-hover text-base font-medium disabled:opacity-50 transition-colors w-full mt-4";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-mono text-white">Memory Management Simulator</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={() => { setActiveTab('alloc'); resetAlloc(); }}
            className={`px-4 py-2 font-medium ${activeTab === 'alloc' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}
          >
            Memory Allocation
          </button>
          <button 
            onClick={() => { setActiveTab('page'); resetPage(); }}
            className={`px-4 py-2 font-medium ${activeTab === 'page' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}
          >
            Page Replacement
          </button>
        </div>
      </div>

      {activeTab === 'alloc' && (
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          <form onSubmit={handleSimulateAlloc} className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {ALLOC_ALGOS.map(algo => (
                <button
                  key={algo.id} type="button"
                  onClick={() => setAllocAlgo(algo.id)}
                  className={`px-3 py-1 text-sm border border-border ${allocAlgo === algo.id ? 'bg-accent text-base border-accent' : 'bg-surface'}`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-sm font-medium">Block Sizes (KB, comma-separated)</label>
              <textarea value={blockSizes} onChange={e => setBlockSizes(e.target.value)} className={inputClass} rows="2" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Process Sizes (KB, comma-separated)</label>
              <textarea value={processSizes} onChange={e => setProcessSizes(e.target.value)} className={inputClass} rows="2" />
            </div>

            <button type="submit" disabled={allocLoading} className={btnClass}>
              {allocLoading ? 'Running...' : 'Run Simulation'}
            </button>
            {allocError && <div className="text-error text-sm">{allocError}</div>}
          </form>

          <div>
            {allocResult ? (
              <MemoryBlocks blocks={allocResult.blocks} allocations={allocResult.allocations} />
            ) : (
              <div className="h-48 border border-border bg-surface flex items-center justify-center text-text-muted text-sm">Results will appear here</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'page' && (
        <div className="flex flex-col gap-8">
          <form onSubmit={handleSimulatePage} className="flex flex-col gap-4 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {PAGE_ALGOS.map(algo => (
                <button
                  key={algo.id} type="button"
                  onClick={() => setPageAlgo(algo.id)}
                  className={`px-3 py-1 text-sm border border-border ${pageAlgo === algo.id ? 'bg-accent text-base border-accent' : 'bg-surface'}`}
                >
                  {algo.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex flex-col gap-1 w-32">
                <label className="text-sm font-medium">Frames</label>
                <input type="number" min="1" value={numFrames} onChange={e => setNumFrames(e.target.value)} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-medium">Reference String (comma-separated)</label>
                <input type="text" value={refString} onChange={e => setRefString(e.target.value)} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={pageLoading} className={`${btnClass} md:w-48`}>
              {pageLoading ? 'Running...' : 'Run Simulation'}
            </button>
            {pageError && <div className="text-error text-sm">{pageError}</div>}
          </form>

          <div>
            {pageResult ? (
              <FrameTable steps={pageResult.steps} numFrames={parseInt(numFrames) || 3} />
            ) : (
              <div className="h-48 border border-border bg-surface flex items-center justify-center text-text-muted text-sm">Results will appear here</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
