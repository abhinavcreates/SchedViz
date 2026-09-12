#include "round_robin.h"
#include <algorithm>
#include <sstream>
#include <deque>
#include <map>

// Round Robin Scheduling
// Each process gets a small unit of CPU time (time quantum).
// Good for fairness and responsiveness.
SchedulingResult runRoundRobin(std::vector<Process> processes, int quantum) {
    SchedulingResult result;
    int n = processes.size();
    if (n == 0) return result;

    std::stable_sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrival == b.arrival) return a.id < b.id;
        return a.arrival < b.arrival;
    });

    std::deque<Process> ready_queue;
    int current_time = 0;
    int arrival_index = 0;
    std::map<std::string, int> remaining;
    
    for (const auto& p : processes) {
        remaining[p.id] = p.burst;
    }

    while (arrival_index < n && processes[arrival_index].arrival <= current_time) {
        ready_queue.push_back(processes[arrival_index++]);
    }

    long long totalTurnaround = 0;
    long long totalWaiting = 0;

    while (!ready_queue.empty() || arrival_index < n) {
        if (ready_queue.empty()) {
            TimelineSegment idleSeg;
            idleSeg.id = "IDLE";
            idleSeg.start = current_time;
            idleSeg.end = processes[arrival_index].arrival;
            idleSeg.reason = "CPU idle — no process available";
            result.timeline.push_back(idleSeg);
            
            current_time = processes[arrival_index].arrival;
            while (arrival_index < n && processes[arrival_index].arrival <= current_time) {
                ready_queue.push_back(processes[arrival_index++]);
            }
            continue;
        }
        
        Process proc = ready_queue.front();
        ready_queue.pop_front();
        
        int time_slice = std::min(quantum, remaining[proc.id]);
        int start = current_time;
        int end = current_time + time_slice;
        
        while (arrival_index < n && processes[arrival_index].arrival <= end) {
            ready_queue.push_back(processes[arrival_index++]);
        }
        
        remaining[proc.id] -= time_slice;
        current_time = end;
        
        TimelineSegment seg;
        seg.id = proc.id;
        seg.start = start;
        seg.end = end;
        std::ostringstream reason;
        reason << proc.id << " scheduled — Round Robin, quantum " << quantum 
               << "ms (remaining: " << remaining[proc.id] << "ms after)";
        seg.reason = reason.str();
        result.timeline.push_back(seg);
        
        if (remaining[proc.id] > 0) {
            ready_queue.push_back(proc);
        } else {
            ProcessMetrics metrics;
            metrics.id = proc.id;
            // Need to find original arrival and burst
            auto it = std::find_if(processes.begin(), processes.end(), [&proc](const Process& p) {
                return p.id == proc.id;
            });
            metrics.arrival = it->arrival;
            metrics.burst = it->burst;
            metrics.completion = current_time;
            metrics.turnaround = current_time - metrics.arrival;
            metrics.waiting = metrics.turnaround - metrics.burst;
            result.metrics.push_back(metrics);
            
            totalTurnaround += metrics.turnaround;
            totalWaiting += metrics.waiting;
        }
    }
    
    result.avgTurnaround = static_cast<double>(totalTurnaround) / n;
    result.avgWaiting = static_cast<double>(totalWaiting) / n;
    
    return result;
}
