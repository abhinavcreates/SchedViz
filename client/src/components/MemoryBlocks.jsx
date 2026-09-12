import React from 'react';
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {Array} props.blocks - [{ index, originalSize, remaining, allocatedTo }]
 * @param {Array} props.allocations - [{ processId, processSize, blockIndex }]
 */
export default function MemoryBlocks({ blocks, allocations }) {
  if (!blocks || blocks.length === 0) return null;

  const totalSize = blocks.reduce((sum, b) => sum + b.originalSize, 0);
  let totalInternalFragmentation = 0;

  blocks.forEach(b => {
    if (b.allocatedTo) {
      totalInternalFragmentation += b.remaining;
    }
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex h-24 w-full border border-border overflow-hidden">
        {blocks.map((block, idx) => {
          const widthPct = (block.originalSize / totalSize) * 100;
          const isAllocated = !!block.allocatedTo;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`h-full border-r border-border last:border-r-0 relative flex flex-col justify-center items-center ${
                isAllocated ? 'bg-accent/20' : 'bg-surface'
              }`}
              style={{ width: `${widthPct}%` }}
            >
              <div className="text-xs text-text-muted mb-1 absolute top-1 left-2">Block {block.index}</div>
              
              {isAllocated ? (
                <>
                  <div className="font-mono text-accent font-bold">{block.allocatedTo}</div>
                  <div className="font-mono text-[10px] mt-1">Rem: {block.remaining}KB</div>
                </>
              ) : (
                <div className="font-mono text-sm">{block.originalSize}KB</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="border border-border mt-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-accent">
            <tr>
              <th className="p-2 border-b border-border">Process ID</th>
              <th className="p-2 border-b border-border">Requested Size</th>
              <th className="p-2 border-b border-border">Allocated Block</th>
              <th className="p-2 border-b border-border">Fragmentation</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, idx) => {
              const allocatedBlock = blocks.find(b => b.index === a.blockIndex);
              return (
                <tr key={idx} className="border-b border-border last:border-0 odd:bg-base even:bg-[#1e1e1e]">
                  <td className="p-2 font-mono">{a.processId}</td>
                  <td className="p-2 font-mono">{a.processSize}KB</td>
                  <td className="p-2 font-mono">{a.blockIndex !== null ? `Block ${a.blockIndex}` : <span className="text-error">Not Allocated</span>}</td>
                  <td className="p-2 font-mono">{allocatedBlock ? `${allocatedBlock.remaining}KB` : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 border border-border bg-surface text-sm flex items-center justify-between">
        <span className="text-text-muted">Total Internal Fragmentation:</span>
        <span className="font-mono text-accent font-bold">{totalInternalFragmentation}KB</span>
      </div>
    </div>
  );
}
