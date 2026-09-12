#pragma once
#include <string>
#include <vector>

// One step in the page replacement simulation
struct PageStep {
    int page;                    // page being referenced
    std::vector<int> frames;     // frame contents after this step (-1 = empty)
    bool fault;                  // true = page fault, false = page hit
    int replaced;                // page that was replaced (-1 if none)
    std::string reason;          // explanation for tooltip
};

struct PageResult {
    std::vector<PageStep> steps;
    int totalFaults;
    int totalHits;
    double faultRate;  // totalFaults / total references
};

PageResult runFIFO(std::vector<int> referenceString, int numFrames);
PageResult runLRU(std::vector<int> referenceString, int numFrames);
PageResult runOptimal(std::vector<int> referenceString, int numFrames);
