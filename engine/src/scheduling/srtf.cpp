#include "srtf.h"
#include <algorithm>
#include <sstream>
#include <vector>
#include <map>

// Shortest Remaining Time First (SRTF) - Preemptive SJF
// Selects the process with the smallest remaining burst time.
// Preempts running process if a new process arrives with a shorter remaining burst.
SchedulingResult runSRTF(std::vector<Process> processes) {
    SchedulingResult result;
    int n = processes.size();
    if (n == 0) return result;

    std::vector<int> remaining(n);
    for (int i = 0; i < n; ++i) {
        remaining[i] = processes[i].burst;
    }
    
    std::vector<bool> completed(n, false);
    int current_time = 0;
    int completed_count = 0;
    int running_idx = -1;
    int last_switch_time = 0;
    
    long long totalTurnaround = 0;
    long long totalWaiting = 0;
    
    while (completed_count < n) {
        int best_idx = -1;
        int min_rem = 1e9;
        int available_count = 0;
        
        for (int i = 0; i < n; ++i) {
            if (!completed[i] && processes[i].arrival <= current_time) {
                available_count++;
                if (remaining[i] < min_rem) {
                    min_rem = remaining[i];
                    best_idx = i;
                } else if (remaining[i] == min_rem) {
                    if (best_idx == -1 || processes[i].arrival < processes[best_idx].arrival) {
                        best_idx = i;
                    } else if (processes[i].arrival == processes[best_idx].arrival) {
                        if (processes[i].id < processes[best_idx].id) {
                            best_idx = i;
                        }
                    }
                }
            }
        }
        
        if (best_idx != running_idx) {
            if (running_idx != -1) {
                TimelineSegment seg;
                seg.id = processes[running_idx].id;
                seg.start = last_switch_time;
                seg.end = current_time;
                if (best_idx != -1 && remaining[best_idx] < remaining[running_idx]) {
                    std::ostringstream reason;
                    reason << processes[best_idx].id << " preempted " << processes[running_idx].id 
                           << " — " << processes[best_idx].id << " arrived with remaining burst " 
                           << remaining[best_idx] << "ms < " << processes[running_idx].id << "'s remaining " 
                           << remaining[running_idx] << "ms";
                    seg.reason = reason.str();
                } else {
                    std::ostringstream reason;
                    reason << processes[running_idx].id << " continues — shortest remaining burst (" 
                           << remaining[running_idx] << "ms) among available processes";
                    seg.reason = reason.str();
                }
                if (seg.end > seg.start) result.timeline.push_back(seg);
            } else if (last_switch_time < current_time) {
                TimelineSegment idleSeg;
                idleSeg.id = "IDLE";
                idleSeg.start = last_switch_time;
                idleSeg.end = current_time;
                idleSeg.reason = "CPU idle — no process available";
                result.timeline.push_back(idleSeg);
            }
            running_idx = best_idx;
            last_switch_time = current_time;
        }
        
        if (running_idx == -1) {
            int next_arrival = 1e9;
            for (int i = 0; i < n; ++i) {
                if (!completed[i] && processes[i].arrival > current_time) {
                    next_arrival = std::min(next_arrival, processes[i].arrival);
                }
            }
            current_time = next_arrival;
        } else {
            int next_arrival = 1e9;
            for (int i = 0; i < n; ++i) {
                if (!completed[i] && processes[i].arrival > current_time) {
                    next_arrival = std::min(next_arrival, processes[i].arrival);
                }
            }
            
            int time_to_complete = remaining[running_idx];
            int next_event = std::min(next_arrival, current_time + time_to_complete);
            
            remaining[running_idx] -= (next_event - current_time);
            current_time = next_event;
            
            if (remaining[running_idx] == 0) {
                TimelineSegment seg;
                seg.id = processes[running_idx].id;
                seg.start = last_switch_time;
                seg.end = current_time;
                std::ostringstream reason;
                if (last_switch_time == processes[running_idx].arrival && processes[running_idx].burst == time_to_complete) {
                    reason << processes[running_idx].id << " scheduled — shortest remaining burst (" 
                           << time_to_complete << "ms) at t=" << last_switch_time;
                } else {
                    reason << processes[running_idx].id << " continues — shortest remaining burst (" 
                           << time_to_complete << "ms) among available processes";
                }
                seg.reason = reason.str();
                result.timeline.push_back(seg);
                
                completed[running_idx] = true;
                completed_count++;
                
                ProcessMetrics metrics;
                metrics.id = processes[running_idx].id;
                metrics.arrival = processes[running_idx].arrival;
                metrics.burst = processes[running_idx].burst;
                metrics.completion = current_time;
                metrics.turnaround = current_time - metrics.arrival;
                metrics.waiting = metrics.turnaround - metrics.burst;
                result.metrics.push_back(metrics);
                
                totalTurnaround += metrics.turnaround;
                totalWaiting += metrics.waiting;
                
                running_idx = -1;
                last_switch_time = current_time;
            }
        }
    }
    
    result.avgTurnaround = static_cast<double>(totalTurnaround) / n;
    result.avgWaiting = static_cast<double>(totalWaiting) / n;
    
    return result;
}
