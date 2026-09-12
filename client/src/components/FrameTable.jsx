import React from 'react';
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {Array} props.steps - [{ page, frames, fault, replaced, reason }]
 * @param {number} props.numFrames
 */
export default function FrameTable({ steps, numFrames }) {
  if (!steps || steps.length === 0) return null;

  const totalFaults = steps.filter(s => s.fault).length;
  const totalHits = steps.length - totalFaults;
  const faultRate = steps.length > 0 ? ((totalFaults / steps.length) * 100).toFixed(1) : 0;

  return (
    <div className="w-full mt-6 overflow-x-auto pb-4">
      <div className="border border-border min-w-max">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="p-3 bg-surface text-text-muted border-r border-b border-border w-24">Ref String</th>
              {steps.map((step, idx) => (
                <th 
                  key={idx} 
                  className={`p-3 font-mono border-b border-r border-border text-center w-12 ${
                    step.fault ? 'text-error' : 'text-success'
                  }`}
                >
                  {step.page}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numFrames }).map((_, frameIdx) => (
              <tr key={frameIdx}>
                <td className="p-3 bg-surface text-accent font-medium border-r border-b border-border w-24">
                  Frame {frameIdx}
                </td>
                {steps.map((step, stepIdx) => {
                  const val = step.frames[frameIdx];
                  const isNew = step.fault && val === step.page;
                  return (
                    <td 
                      key={`${frameIdx}-${stepIdx}`}
                      className="p-3 border-r border-b border-border text-center w-12 h-12 relative font-mono"
                    >
                      {isNew ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: stepIdx * 0.1 }}
                          className="bg-accent/20 text-accent font-bold w-full h-full flex items-center justify-center absolute inset-0"
                        >
                          {val !== null ? val : '-'}
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          {val !== null ? val : '-'}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-6 mt-6 p-4 border border-border bg-surface text-sm w-fit">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Total Faults</span>
          <span className="font-mono text-error font-bold text-lg">{totalFaults}</span>
        </div>
        <div className="w-px bg-border"></div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Total Hits</span>
          <span className="font-mono text-success font-bold text-lg">{totalHits}</span>
        </div>
        <div className="w-px bg-border"></div>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Fault Rate</span>
          <span className="font-mono text-white font-bold text-lg">{faultRate}%</span>
        </div>
      </div>
    </div>
  );
}
