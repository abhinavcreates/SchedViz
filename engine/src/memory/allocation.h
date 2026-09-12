#pragma once
#include <string>
#include <vector>

// Input: a memory partition (block)
struct MemoryBlock {
    int originalSize;     // original block capacity in KB
    int remaining;        // free space remaining after allocation
    std::string allocatedTo; // process ID, or "" if free
};

// Input: a process needing memory
struct MemoryProcess {
    std::string id;
    int size;  // memory needed in KB
};

// Result for memory allocation
struct AllocationResult {
    std::vector<MemoryBlock> blocks;         // final state of all blocks
    struct ProcessAllocation {
        std::string id;
        int size;
        int blockIndex;    // -1 if not allocated
        std::string status; // "allocated" or "not_allocated"
    };
    std::vector<ProcessAllocation> allocations;
    int totalFragmentation; // sum of remaining space in allocated blocks
};

AllocationResult runFirstFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes);
AllocationResult runBestFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes);
AllocationResult runWorstFit(std::vector<int> blockSizes, std::vector<MemoryProcess> processes);
