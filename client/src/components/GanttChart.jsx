import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const PROCESS_COLORS = ['#e07a3f','#d4a853','#8b6f47','#c94f4f','#6b8c6b','#5b7fa6','#9b59b6','#2ecc71','#e74c3c','#1abc9c'];
const IDLE_COLOR = '#2a2a2a';

/**
 * @param {Object} props
 * @param {Array} props.timeline - [{ id, start, end, reason }]
 * @param {number} props.totalTime
 */
export default function GanttChart({ timeline, totalTime }) {
  const [hovered, setHovered] = useState(null);

  // Map each unique process ID to a color index based on first appearance
  const colorMap = useMemo(() => {
    const map = new Map();
    let colorIdx = 0;
    timeline.forEach(seg => {
      if (seg.id !== 'IDLE' && !map.has(seg.id)) {
        map.set(seg.id, PROCESS_COLORS[colorIdx % PROCESS_COLORS.length]);
        colorIdx++;
      }
    });
    return map;
  }, [timeline]);

  const getColor = (id) => id === 'IDLE' ? IDLE_COLOR : colorMap.get(id);

  if (!timeline || timeline.length === 0) {
    return <div className="p-4 text-text-muted text-center border border-border bg-surface">No timeline data available.</div>;
  }

  // Find unique processes for legend
  const uniqueProcesses = Array.from(colorMap.entries()).map(([id, color]) => ({ id, color }));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* overflow-x-auto: chart scrolls within its container on narrow screens */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '480px' }}>
          <div className="flex h-16 w-full border border-border bg-surface overflow-hidden relative">
            {timeline.map((segment, idx) => {
              const widthPct = ((segment.end - segment.start) / totalTime) * 100;
              const bg = getColor(segment.id);
              const showText = widthPct > 3;

              return (
                <motion.div
                  key={idx}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.15, ease: 'easeOut' }}
                  onMouseEnter={() => setHovered(segment)}
                  onMouseLeave={() => setHovered(null)}
                  className="h-full border-r border-border last:border-r-0 flex items-center justify-center relative group"
                  style={{ width: `${widthPct}%`, backgroundColor: bg }}
                >
                  {showText && <span className="font-mono text-white text-xs z-10 truncate px-1">{segment.id}</span>}
                  {hovered === segment && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-base border border-accent p-2 z-20 whitespace-nowrap shadow-lg pointer-events-none">
                      <div className="font-mono text-xs text-text-primary mb-1">
                        {segment.id} [{segment.start} - {segment.end}]
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Dur: {segment.end - segment.start} | {segment.reason}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Time axis */}
          <div className="flex w-full relative h-6 mt-1">
            {timeline.map((segment, idx) => {
              const leftPct = (segment.start / totalTime) * 100;
              return (
                <div key={`start-${idx}`} className="absolute top-0 flex flex-col items-center" style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}>
                  <div className="h-2 w-px bg-border" />
                  <span className="font-mono text-[10px] text-text-muted">{segment.start}</span>
                </div>
              );
            })}
            <div className="absolute top-0 right-0 flex flex-col items-end transform translate-x-1/2">
              <div className="h-2 w-px bg-border" />
              <span className="font-mono text-[10px] text-text-muted">{totalTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2">
        {uniqueProcesses.map(p => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: p.color }}></div>
            <span className="font-mono text-xs">{p.id}</span>
          </div>
        ))}
        {timeline.some(s => s.id === 'IDLE') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: IDLE_COLOR }}></div>
            <span className="font-mono text-xs">IDLE</span>
          </div>
        )}
      </div>
    </div>
  );
}
