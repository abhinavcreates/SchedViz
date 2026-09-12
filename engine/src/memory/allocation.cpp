#include "allocation.h"
#include <algorithm>

// Memory Allocation Simulator
// Demonstrates First Fit, Best Fit, and Worst Fit algorithms.
// External fragmentation is reduced by Best Fit but can still be an issue.

AllocationResult runFirstFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes) {
    AllocationResult result;
    for (int size : blockSizes) {
        result.blocks.push_back({size, size, ""});
    }

    for (const auto& proc : processes) {
        bool allocated = false;
        for (size_t i = 0; i < result.blocks.size(); ++i) {
            if (result.blocks[i].remaining >= proc.size && result.blocks[i].allocatedTo.empty()) {
                result.blocks[i].remaining -= proc.size;
                result.blocks[i].allocatedTo = proc.id;
                result.allocations.push_back({proc.id, proc.size, (int)i, "allocated"});
                allocated = true;
                break;
            }
        }
        if (!allocated) {
            result.allocations.push_back({proc.id, proc.size, -1, "not_allocated"});
        }
    }

    result.totalFragmentation = 0;
    for (const auto& block : result.blocks) {
        if (!block.allocatedTo.empty()) {
            result.totalFragmentation += block.remaining;
        }
    }
    return result;
}

AllocationResult runBestFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes) {
    AllocationResult result;
    for (int size : blockSizes) {
        result.blocks.push_back({size, size, ""});
    }

    for (const auto& proc : processes) {
        int best_idx = -1;
        int min_diff = 1e9;
        for (size_t i = 0; i < result.blocks.size(); ++i) {
            if (result.blocks[i].remaining >= proc.size && result.blocks[i].allocatedTo.empty()) {
                if (result.blocks[i].remaining - proc.size < min_diff) {
                    min_diff = result.blocks[i].remaining - proc.size;
                    best_idx = i;
                }
            }
        }
        if (best_idx != -1) {
            result.blocks[best_idx].remaining -= proc.size;
            result.blocks[best_idx].allocatedTo = proc.id;
            result.allocations.push_back({proc.id, proc.size, best_idx, "allocated"});
        } else {
            result.allocations.push_back({proc.id, proc.size, -1, "not_allocated"});
        }
    }

    result.totalFragmentation = 0;
    for (const auto& block : result.blocks) {
        if (!block.allocatedTo.empty()) {
            result.totalFragmentation += block.remaining;
        }
    }
    return result;
}

AllocationResult runWorstFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes) {
    AllocationResult result;
    for (int size : blockSizes) {
        result.blocks.push_back({size, size, ""});
    }

    for (const auto& proc : processes) {
        int worst_idx = -1;
        int max_diff = -1;
        for (size_t i = 0; i < result.blocks.size(); ++i) {
            if (result.blocks[i].remaining >= proc.size && result.blocks[i].allocatedTo.empty()) {
                if (result.blocks[i].remaining - proc.size > max_diff) {
                    max_diff = result.blocks[i].remaining - proc.size;
                    worst_idx = i;
                }
            }
        }
        if (worst_idx != -1) {
            result.blocks[worst_idx].remaining -= proc.size;
            result.blocks[worst_idx].allocatedTo = proc.id;
            result.allocations.push_back({proc.id, proc.size, worst_idx, "allocated"});
        } else {
            result.allocations.push_back({proc.id, proc.size, -1, "not_allocated"});
        }
    }

    result.totalFragmentation = 0;
    for (const auto& block : result.blocks) {
        if (!block.allocatedTo.empty()) {
            result.totalFragmentation += block.remaining;
        }
    }
    return result;
}
