import React from 'react';
import { motion } from 'framer-motion';

/**
 * MemoryBlocks — visualises memory partition allocation results.
 *
 * Animations (all ≤ 400ms per spec):
 *   - Allocated blocks: staggered fade-in from below + brief scale-up (1→1.03→1)
 *     with a teal background fill to mark the allocated region.
 *   - Fragmented blocks (allocated but with remaining > 0): after the entrance
 *     animation, a subtle teal pulse (border glow) draws attention to wasted space.
 *   - Free blocks: simple staggered fade-in, no extra effects.
 *
 * Teal (#2dd4bf) is used throughout as the Memory Management section accent.
 * Props are identical to the previous version — no API or data-flow changes.
 *
 * @param {Object}  props
 * @param {Array}   props.blocks      - [{ index, originalSize, remaining, allocatedTo }]
 * @param {Array}   props.allocations - [{ id, size, blockIndex, status }]
 */
export default function MemoryBlocks({ blocks, allocations }) {
  if (!blocks || blocks.length === 0) return null;

  const totalSize = blocks.reduce((sum, b) => sum + b.originalSize, 0);

  // Total internal fragmentation = wasted space in allocated (but not fully used) blocks
  const totalInternalFragmentation = blocks
    .filter(b => b.allocatedTo)
    .reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Visual memory bar ─────────────────────────────────────────────── */}
      {/* overflow-x-auto: bar scrolls within its container on narrow screens */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '400px' }}>
          <div className="flex h-24 w-full border border-border overflow-hidden" style={{ borderColor: '#333' }}>
            {blocks.map((block, idx) => {
              const widthPct    = (block.originalSize / totalSize) * 100;
              const isAllocated = !!block.allocatedTo;
              // A block is "fragmented" when it's allocated but has leftover space
              const isFragmented = isAllocated && block.remaining > 0;

              return (
                <motion.div
                  key={idx}
                  // ── Entrance: stagger + slight upward slide ─────────────────
                  initial={{ opacity: 0, y: 16 }}
                  animate={
                    isFragmented
                      ? [
                          // Step 1: entrance slide-in
                          { opacity: 1, y: 0, scale: 1 },
                          // Step 2: scale pop
                          { scale: 1.03 },
                          // Step 3: settle back
                          { scale: 1 },
                        ]
                      : isAllocated
                      ? [
                          { opacity: 1, y: 0, scale: 1 },
                          { scale: 1.03 },
                          { scale: 1 },
                        ]
                      : { opacity: 1, y: 0 }
                  }
                  transition={
                    isAllocated
                      ? {
                          duration: 0.35,
                          delay: idx * 0.08,
                          ease: 'easeOut',
                          times: [0, 0.7, 1], // keyframe timing for the scale sequence
                        }
                      : { duration: 0.3, delay: idx * 0.08, ease: 'easeOut' }
                  }
                  className="h-full border-r last:border-r-0 relative flex flex-col justify-center items-center"
                  style={{
                    width: `${widthPct}%`,
                    borderColor: '#333',
                    // Allocated: teal-tinted bg; fragmented gets a slightly stronger tint
                    backgroundColor: isAllocated
                      ? 'rgba(45,212,191,0.15)'
                      : '#242424',
                  }}
                >
                  {/* Fragmentation pulse ring — animates after entrance to signal wasted space */}
                  {isFragmented && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{ delay: idx * 0.08 + 0.4, duration: 0.35, ease: 'easeInOut' }}
                      style={{ boxShadow: 'inset 0 0 0 2px #2dd4bf' }}
                    />
                  )}

                  {/* Block index label */}
                  <div className="text-[10px] text-text-muted absolute top-1 left-2">
                    Block {block.index}
                  </div>

                  {isAllocated ? (
                    <>
                      {/* Process ID in teal */}
                      <span className="font-mono font-bold text-sm" style={{ color: '#2dd4bf' }}>
                        {block.allocatedTo}
                      </span>
                      <span className="font-mono text-[10px] mt-1 text-text-muted">
                        Rem: {block.remaining}KB
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-sm text-text-muted">
                      {block.originalSize}KB
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Allocation details table ──────────────────────────────────────── */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="p-2 border-b border-border font-medium" style={{ color: '#2dd4bf' }}>Process ID</th>
              <th className="p-2 border-b border-border font-medium" style={{ color: '#2dd4bf' }}>Requested Size</th>
              <th className="p-2 border-b border-border font-medium" style={{ color: '#2dd4bf' }}>Allocated Block</th>
              <th className="p-2 border-b border-border font-medium" style={{ color: '#2dd4bf' }}>Fragmentation</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, idx) => {
              const allocatedBlock = blocks.find(b => b.index === a.blockIndex);
              return (
                <tr
                  key={idx}
                  className="border-b border-border last:border-0"
                  style={{ backgroundColor: idx % 2 === 0 ? '#1a1a1a' : '#1e1e1e' }}
                >
                  <td className="p-2 font-mono">{a.id}</td>
                  <td className="p-2 font-mono">{a.size}KB</td>
                  <td className="p-2 font-mono">
                    {a.blockIndex !== -1 && a.blockIndex !== null ? (
                      `Block ${a.blockIndex}`
                    ) : (
                      <span className="text-error">Not Allocated</span>
                    )}
                  </td>
                  <td className="p-2 font-mono">
                    {allocatedBlock ? `${allocatedBlock.remaining}KB` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Fragmentation summary ─────────────────────────────────────────── */}
      <div
        className="p-3 border border-border bg-surface text-sm flex items-center justify-between"
        style={{ borderColor: '#333' }}
      >
        <span className="text-text-muted">Total Internal Fragmentation:</span>
        <span className="font-mono font-bold" style={{ color: '#2dd4bf' }}>
          {totalInternalFragmentation}KB
        </span>
      </div>
    </div>
  );
}
