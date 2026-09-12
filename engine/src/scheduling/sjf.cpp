#include "sjf.h"
#include <algorithm>
#include <sstream>
#include <vector>

// Shortest Job First (SJF) - Non-Preemptive
// SJF minimizes average waiting time by executing the shortest tasks first.
// It is non-preemptive, meaning once a process starts, it runs to completion.
// Note: Can cause starvation for long processes.
SchedulingResult runSJF(std::vector<Process> processes) {
    SchedulingResult result;
    int n = processes.size();
    if (n == 0) return result;

    std::vector<bool> completed(n, false);
    int current_time = 0;
    int completed_count = 0;
    
    long long totalTurnaround = 0;
    long long totalWaiting = 0;

    while (completed_count < n) {
        int shortest_idx = -1;
        int min_burst = 1e9;
        int min_arrival = 1e9;
        int available_count = 0;

        // Find available process with minimum burst
        for (int i = 0; i < n; ++i) {
            if (!completed[i] && processes[i].arrival <= current_time) {
                available_count++;
                if (processes[i].burst < min_burst) {
                    min_burst = processes[i].burst;
                    shortest_idx = i;
                    min_arrival = processes[i].arrival;
                } else if (processes[i].burst == min_burst) {
                    // Tie break by arrival time, then ID
                    if (processes[i].arrival < min_arrival) {
                        shortest_idx = i;
                        min_arrival = processes[i].arrival;
                    } else if (processes[i].arrival == min_arrival) {
                        if (shortest_idx == -1 || processes[i].id < processes[shortest_idx].id) {
                            shortest_idx = i;
                        }
                    }
                }
            }
        }

        if (shortest_idx == -1) {
            // CPU Idle, find next arrival time
            int next_arrival = 1e9;
            for (int i = 0; i < n; ++i) {
                if (!completed[i] && processes[i].arrival > current_time) {
                    next_arrival = std::min(next_arrival, processes[i].arrival);
                }
            }
            
            TimelineSegment idleSeg;
            idleSeg.id = "IDLE";
            idleSeg.start = current_time;
            idleSeg.end = next_arrival;
            idleSeg.reason = "CPU idle — no process available";
            result.timeline.push_back(idleSeg);
            current_time = next_arrival;
        } else {
            // Schedule the chosen process
            const Process& proc = processes[shortest_idx];
            TimelineSegment seg;
            seg.id = proc.id;
            seg.start = current_time;
            seg.end = current_time + proc.burst;
            std::ostringstream reason;
            reason << proc.id << " scheduled — shortest burst time (" << proc.burst 
                   << "ms) among " << available_count << " available processes";
            seg.reason = reason.str();
            result.timeline.push_back(seg);

            current_time = seg.end;
            completed[shortest_idx] = true;
            completed_count++;

            ProcessMetrics metrics;
            metrics.id = proc.id;
            metrics.arrival = proc.arrival;
            metrics.burst = proc.burst;
            metrics.completion = current_time;
            metrics.turnaround = metrics.completion - proc.arrival;
            metrics.waiting = metrics.turnaround - proc.burst;
            result.metrics.push_back(metrics);
            
            totalTurnaround += metrics.turnaround;
            totalWaiting += metrics.waiting;
        }
    }

    result.avgTurnaround = static_cast<double>(totalTurnaround) / n;
    result.avgWaiting = static_cast<double>(totalWaiting) / n;
    
    // Maintain output order as per original input for metrics (optional, but good for consistency)
    return result;
}
