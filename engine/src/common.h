#pragma once
#include <string>
#include <vector>

// Represents an input process for CPU scheduling
struct Process {
    std::string id;
    int arrival;   // arrival time
    int burst;     // total CPU burst time needed
    int priority;  // lower number = higher priority (default 0 if not used)
};

// One segment in the Gantt chart timeline
struct TimelineSegment {
    std::string id;     // process ID, or "IDLE" for idle periods
    int start;
    int end;
    std::string reason; // tooltip explanation for the frontend
};

// Per-process scheduling metrics computed after simulation
struct ProcessMetrics {
    std::string id;
    int arrival;
    int burst;
    int completion;   // time when process finishes
    int turnaround;   // completion - arrival
    int waiting;      // turnaround - burst
};

// Full result returned by any scheduling algorithm
struct SchedulingResult {
    std::vector<TimelineSegment> timeline;
    std::vector<ProcessMetrics> metrics;
    double avgTurnaround;
    double avgWaiting;
};
