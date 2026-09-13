import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FrameTable — step-by-step page replacement visualisation.
 *
 * Animations (all ≤ 400ms per spec):
 *   - Columns reveal one at a time (stagger delay = stepIdx × 0.15s).
 *   - Page fault cells: flash with a red background (fade in/out ~300ms).
 *   - Page hit  cells: flash with a green background (fade in/out ~300ms).
 *   - When a frame slot gains a NEW page value (newly loaded), the number
 *     crossfades in via AnimatePresence (key change triggers exit/enter).
 *   - Teal (#2dd4bf) is used for frame labels and stats to match the
 *     Memory Management section theme.
 *
 * Props are identical to the previous version — no API or data-flow changes.
 *
 * @param {Object} props
 * @param {Array}  props.steps     - [{ page, frames, fault, replaced, reason }]
 * @param {number} props.numFrames
 */
export default function FrameTable({ steps, numFrames }) {
  if (!steps || steps.length === 0) return null;

  const totalFaults = steps.filter(s => s.fault).length;
  const totalHits   = steps.length - totalFaults;
  const faultRate   = steps.length > 0 ? ((totalFaults / steps.length) * 100).toFixed(1) : 0;

  return (
    <div className="w-full mt-4 overflow-x-auto pb-4">
      <div className="border border-border min-w-max">
        <table className="text-sm border-collapse">
          {/* ── Column headers: page reference string ───────────────────── */}
          <thead>
            <tr>
              {/* Row label cell */}
              <th className="p-3 bg-surface text-text-muted border-r border-b border-border w-24 text-left font-normal">
                Ref String
              </th>

              {steps.map((step, stepIdx) => (
                <motion.th
                  key={stepIdx}
                  /* Columns stagger in — the header acts as the entry trigger */
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: stepIdx * 0.07 }}
                  className="p-3 font-mono border-b border-r border-border text-center w-12 font-medium"
                  style={{ color: step.fault ? '#e05252' : '#6bbd6b' }}
                >
                  {step.page}
                </motion.th>
              ))}
            </tr>
          </thead>

          {/* ── Frame rows ─────────────────────────────────────────────── */}
          <tbody>
            {Array.from({ length: numFrames }).map((_, frameIdx) => (
              <tr key={frameIdx}>
                {/* Frame label — teal to match Memory Management theme */}
                <td
                  className="p-3 bg-surface font-medium border-r border-b border-border w-24"
                  style={{ color: '#2dd4bf' }}
                >
                  Frame {frameIdx}
                </td>

                {steps.map((step, stepIdx) => {
                  const val = step.frames[frameIdx];
                  // A cell is "newly loaded" when this step is a fault AND
                  // this frame slot holds the page that was just brought in.
                  const isNewlyLoaded = step.fault && val === step.page;

                  // Background flash color:
                  //   fault cell → brief red tint
                  //   hit cell (page matches current ref) → brief green tint
                  //   otherwise → transparent
                  const isFaultStep = step.fault;
                  const isHitStep   = !step.fault && val === step.page;

                  // flash is the transient background we animate; we use a
                  // wrapper so the flash doesn't affect text colour.
                  let flashBg = null;
                  if (isFaultStep && isNewlyLoaded) flashBg = 'rgba(224,82,82,0.25)';
                  else if (isHitStep)               flashBg = 'rgba(107,189,107,0.20)';

                  return (
                    <motion.td
                      key={`${frameIdx}-${stepIdx}`}
                      /* Stagger columns — same delay as the header */
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: stepIdx * 0.07 }}
                      className="border-r border-b border-border text-center w-12 h-12 relative"
                      style={{ minWidth: '3rem' }}
                    >
                      {/* Flash overlay (fault=red, hit=green) — fades in then out */}
                      {flashBg && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 0.3,
                            delay: stepIdx * 0.07 + 0.1,
                            ease: 'easeInOut',
                            times: [0, 0.4, 1],
                          }}
                          style={{ backgroundColor: flashBg }}
                        />
                      )}

                      {/* Value — AnimatePresence crossfades when page value changes */}
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <AnimatePresence mode="wait">
                          <motion.span
                            /* Key includes the value so a change triggers exit/enter */
                            key={`${frameIdx}-${stepIdx}-${val}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="font-mono text-sm"
                            style={{
                              color: isNewlyLoaded
                                ? '#2dd4bf'          // newly loaded → teal (Memory accent)
                                : val !== null && val !== -1
                                ? '#f5f0e8'          // existing page → cream text
                                : '#9a9080',         // empty slot → muted
                            }}
                          >
                            {val !== null && val !== -1 ? val : '–'}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary stats ────────────────────────────────────────────────── */}
      <div className="flex gap-6 mt-6 p-4 border border-border bg-surface text-sm w-fit">
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Total Faults</span>
          <span className="font-mono font-bold text-lg text-error">{totalFaults}</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Total Hits</span>
          <span className="font-mono font-bold text-lg text-success">{totalHits}</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col gap-1">
          <span className="text-text-muted">Fault Rate</span>
          <span className="font-mono font-bold text-lg" style={{ color: '#f5f0e8' }}>
            {faultRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
