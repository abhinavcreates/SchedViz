#pragma once
#include "../common.h"

// Run Priority Scheduling (non-preemptive)
// Lower priority number = higher priority. Tie-break: arrival time.
SchedulingResult runPriorityNP(std::vector<Process> processes);

// Run Priority Scheduling (preemptive)
// Preempts current process if a higher-priority process arrives
SchedulingResult runPriorityP(std::vector<Process> processes);
