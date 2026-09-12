#include "fcfs.h"
#include <algorithm>
#include <sstream>

// First Come First Served (FCFS) Scheduling
// FCFS is a simple, non-preemptive algorithm that schedules processes strictly
// in the order they arrive.
// Time Complexity: O(n log n) due to sorting, then O(n) for processing.
SchedulingResult runFCFS(std::vector<Process> processes) {
    SchedulingResult result;
    if (processes.empty()) return result;

    // Stable sort to maintain original input order for tie-breaking on arrival time
    std::stable_sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        return a.arrival < b.arrival;
    });

    int current_time = 0;
    long long totalTurnaround = 0;
    long long totalWaiting = 0;

    for (const auto& proc : processes) {
        // If CPU is idle waiting for the next process to arrive
        if (current_time < proc.arrival) {
            TimelineSegment idleSeg;
            idleSeg.id = "IDLE";
            idleSeg.start = current_time;
            idleSeg.end = proc.arrival;
            idleSeg.reason = "CPU idle — no process available";
            result.timeline.push_back(idleSeg);
            current_time = proc.arrival;
        }

        // Run the process to completion
        TimelineSegment seg;
        seg.id = proc.id;
        seg.start = current_time;
        seg.end = current_time + proc.burst;
        std::ostringstream reason;
        reason << proc.id << " scheduled — arrived at t=" << proc.arrival << ", FCFS order";
        seg.reason = reason.str();
        result.timeline.push_back(seg);

        current_time = seg.end;

        // Record metrics
        ProcessMetrics metrics;
        metrics.id = proc.id;
        metrics.arrival = proc.arrival;
        metrics.burst = proc.burst;
        metrics.completion = current_time;
        metrics.turnaround = metrics.completion - metrics.arrival;
        metrics.waiting = metrics.turnaround - metrics.burst;
        result.metrics.push_back(metrics);

        totalTurnaround += metrics.turnaround;
        totalWaiting += metrics.waiting;
    }

    result.avgTurnaround = static_cast<double>(totalTurnaround) / processes.size();
    result.avgWaiting = static_cast<double>(totalWaiting) / processes.size();

    return result;
}
