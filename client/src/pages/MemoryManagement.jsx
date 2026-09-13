import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MemoryBlocks from '../components/MemoryBlocks';
import FrameTable from '../components/FrameTable';
import { useSimulate } from '../hooks/useSimulate';

// ─── Algorithm definitions ────────────────────────────────────────────────────
const ALLOC_ALGOS = [
  { id: 'firstfit', label: 'First Fit',  desc: 'Scans blocks left-to-right and allocates to the first block that fits.' },
  { id: 'bestfit',  label: 'Best Fit',   desc: 'Allocates to the smallest block that fits, minimising wasted space per allocation.' },
  { id: 'worstfit', label: 'Worst Fit',  desc: 'Allocates to the largest block, leaving bigger holes for future requests.' },
];

const PAGE_ALGOS = [
  { id: 'fifo',    label: 'FIFO',    desc: 'Replaces the page that has been in memory the longest (oldest loaded).' },
  { id: 'lru',     label: 'LRU',     desc: 'Replaces the page that was least recently used — approximates optimal under locality.' },
  { id: 'optimal', label: 'Optimal', desc: 'Replaces the page with the furthest next use. Theoretical benchmark — requires future knowledge.' },
];

// ─── Shared input style (teal focus ring instead of orange) ──────────────────
const inputClass =
  'bg-surface border border-border text-text-primary font-mono px-3 py-2 focus:outline-none focus:border-teal w-full';

export default function MemoryManagement() {
  const [activeTab, setActiveTab] = useState('alloc'); // 'alloc' | 'page'

  // Allocation state
  const [allocAlgo, setAllocAlgo]   = useState(ALLOC_ALGOS[0].id);
  const [blockSizes, setBlockSizes] = useState('100, 500, 200, 300, 600');
  const [processSizes, setProcessSizes] = useState('212, 417, 112, 426');

  // Page replacement state
  const [pageAlgo, setPageAlgo]     = useState(PAGE_ALGOS[0].id);
  const [numFrames, setNumFrames]   = useState('3');
  const [refString, setRefString]   = useState('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');

  // API hooks — endpoints and logic are unchanged
  const { result: allocResult, loading: allocLoading, error: allocError, simulate: simAlloc, reset: resetAlloc } =
    useSimulate('/simulate/memory');
  const { result: pageResult,  loading: pageLoading,  error: pageError,  simulate: simPage,  reset: resetPage } =
    useSimulate('/simulate/page');

  // ── Handlers (unchanged logic) ──────────────────────────────────────────────
  const handleSimulateAlloc = async (e) => {
    e.preventDefault();
    const bSizes = blockSizes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const pSizes = processSizes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (bSizes.length === 0 || pSizes.length === 0) return;
    await simAlloc({
      algorithm: allocAlgo,
      blocks: bSizes,
      processes: pSizes.map((size, i) => ({ id: `P${i + 1}`, size })),
    });
  };

  const handleSimulatePage = async (e) => {
    e.preventDefault();
    const refs   = refString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const frames = parseInt(numFrames);
    if (refs.length === 0 || isNaN(frames) || frames <= 0) return;
    await simPage({ algorithm: pageAlgo, frames, referenceString: refs });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header + sub-tab switcher ────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-border pb-0">
        <h1 className="text-2xl font-mono" style={{ color: '#2dd4bf' }}>
          Memory Management Simulator
        </h1>

        {/* Sliding tab indicator — layoutId scoped to memory tabs only */}
        <div className="flex gap-0 border-b border-border">
          {[
            { id: 'alloc', label: 'Memory Allocation' },
            { id: 'page',  label: 'Page Replacement'  },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                tab.id === 'alloc' ? resetAlloc() : resetPage();
              }}
              className="relative px-5 py-2 font-medium text-sm transition-colors focus:outline-none"
              style={{ color: activeTab === tab.id ? '#2dd4bf' : '#9a9080' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="mem-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#2dd4bf' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Memory Allocation tab ─────────────────────────────────────────── */}
      {activeTab === 'alloc' && (
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">

          {/* Form — no animation per spec */}
          <form onSubmit={handleSimulateAlloc} className="flex flex-col gap-4">
            {/* Algorithm selector — teal active state */}
            <div className="flex flex-wrap gap-2">
              {ALLOC_ALGOS.map(algo => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setAllocAlgo(algo.id)}
                  className="px-3 py-1 text-sm border transition-colors focus:outline-none"
                  style={
                    allocAlgo === algo.id
                      ? { backgroundColor: '#2dd4bf', color: '#1a1a1a', borderColor: '#2dd4bf' }
                      : { backgroundColor: '#242424', color: '#f5f0e8', borderColor: '#333333' }
                  }
                >
                  {algo.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted">
              {ALLOC_ALGOS.find(a => a.id === allocAlgo)?.desc}
            </p>

            <div className="flex flex-col gap-1 mt-1">
              <label className="text-sm font-medium">Block Sizes (KB, comma-separated)</label>
              <textarea
                value={blockSizes}
                onChange={e => setBlockSizes(e.target.value)}
                className={inputClass}
                rows="2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Process Sizes (KB, comma-separated)</label>
              <textarea
                value={processSizes}
                onChange={e => setProcessSizes(e.target.value)}
                className={inputClass}
                rows="2"
              />
            </div>

            {/* Teal Run button for Memory section */}
            <button
              type="submit"
              disabled={allocLoading}
              className="py-2 font-medium disabled:opacity-50 transition-colors w-full mt-2 text-base"
              style={{ backgroundColor: '#2dd4bf', color: '#1a1a1a' }}
              onMouseEnter={e => !allocLoading && (e.currentTarget.style.backgroundColor = '#1fb2a0')}
              onMouseLeave={e => !allocLoading && (e.currentTarget.style.backgroundColor = '#2dd4bf')}
            >
              {allocLoading ? 'Running...' : 'Run Simulation'}
            </button>
            {allocError && (
              <div className="text-error text-sm">{allocError}</div>
            )}
          </form>

          {/* Results — fade-up animation when allocResult arrives */}
          <div>
            <AnimatePresence mode="wait">
              {allocResult ? (
                <motion.div
                  key="alloc-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <MemoryBlocks blocks={allocResult.blocks} allocations={allocResult.allocations} />
                </motion.div>
              ) : (
                <div className="h-48 border border-border bg-surface flex items-center justify-center text-text-muted text-sm">
                  Results will appear here
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Page Replacement tab ──────────────────────────────────────────── */}
      {activeTab === 'page' && (
        <div className="flex flex-col gap-8">
          <form onSubmit={handleSimulatePage} className="flex flex-col gap-4 max-w-3xl">
            {/* Algorithm selector — teal active state */}
            <div className="flex flex-wrap gap-2">
              {PAGE_ALGOS.map(algo => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setPageAlgo(algo.id)}
                  className="px-3 py-1 text-sm border transition-colors focus:outline-none"
                  style={
                    pageAlgo === algo.id
                      ? { backgroundColor: '#2dd4bf', color: '#1a1a1a', borderColor: '#2dd4bf' }
                      : { backgroundColor: '#242424', color: '#f5f0e8', borderColor: '#333333' }
                  }
                >
                  {algo.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted">
              {PAGE_ALGOS.find(a => a.id === pageAlgo)?.desc}
            </p>

            <div className="flex gap-4 mt-1">
              <div className="flex flex-col gap-1 w-32">
                <label className="text-sm font-medium">Frames</label>
                <input
                  type="number"
                  min="1"
                  value={numFrames}
                  onChange={e => setNumFrames(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-medium">Reference String (comma-separated)</label>
                <input
                  type="text"
                  value={refString}
                  onChange={e => setRefString(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Teal Run button */}
            <button
              type="submit"
              disabled={pageLoading}
              className="py-2 font-medium disabled:opacity-50 transition-colors md:w-48 text-base"
              style={{ backgroundColor: '#2dd4bf', color: '#1a1a1a' }}
              onMouseEnter={e => !pageLoading && (e.currentTarget.style.backgroundColor = '#1fb2a0')}
              onMouseLeave={e => !pageLoading && (e.currentTarget.style.backgroundColor = '#2dd4bf')}
            >
              {pageLoading ? 'Running...' : 'Run Simulation'}
            </button>
            {pageError && (
              <div className="text-error text-sm">{pageError}</div>
            )}
          </form>

          {/* Results — fade-up animation when pageResult arrives */}
          <AnimatePresence mode="wait">
            {pageResult ? (
              <motion.div
                key="page-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <FrameTable steps={pageResult.steps} numFrames={parseInt(numFrames) || 3} />
              </motion.div>
            ) : (
              <div className="h-48 border border-border bg-surface flex items-center justify-center text-text-muted text-sm">
                Results will appear here
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
