#include "page_replacement.h"
#include <algorithm>
#include <sstream>
#include <deque>
#include <map>

// Page Replacement Simulators
// FIFO can suffer from Belady's Anomaly (more frames = more faults).
// LRU is better practically. Optimal is theoretical upper bound.

PageResult runFIFO(std::vector<int> referenceString, int numFrames) {
    PageResult result;
    result.totalFaults = 0;
    result.totalHits = 0;
    
    std::vector<int> frames(numFrames, -1);
    std::deque<int> fifo_queue; // stores indices of frames
    
    for (size_t step = 0; step < referenceString.size(); ++step) {
        int page = referenceString[step];
        PageStep pstep;
        pstep.page = page;
        
        auto it = std::find(frames.begin(), frames.end(), page);
        if (it != frames.end()) {
            pstep.fault = false;
            pstep.replaced = -1;
            int frame_idx = std::distance(frames.begin(), it);
            std::ostringstream reason;
            reason << "Page " << page << ": hit — already in frame " << frame_idx;
            pstep.reason = reason.str();
            result.totalHits++;
        } else {
            pstep.fault = true;
            result.totalFaults++;
            
            auto empty_it = std::find(frames.begin(), frames.end(), -1);
            if (empty_it != frames.end()) {
                int frame_idx = std::distance(frames.begin(), empty_it);
                frames[frame_idx] = page;
                fifo_queue.push_back(frame_idx);
                pstep.replaced = -1;
                std::ostringstream reason;
                reason << "Page " << page << ": fault — loaded into empty frame " << frame_idx;
                pstep.reason = reason.str();
            } else {
                int frame_idx = fifo_queue.front();
                fifo_queue.pop_front();
                pstep.replaced = frames[frame_idx];
                frames[frame_idx] = page;
                fifo_queue.push_back(frame_idx);
                
                std::ostringstream reason;
                reason << "Page " << page << ": fault — replaced page " << pstep.replaced 
                       << " (loaded earliest, FIFO order)";
                pstep.reason = reason.str();
            }
        }
        pstep.frames = frames;
        result.steps.push_back(pstep);
    }
    
    result.faultRate = referenceString.empty() ? 0 : static_cast<double>(result.totalFaults) / referenceString.size();
    return result;
}

PageResult runLRU(std::vector<int> referenceString, int numFrames) {
    PageResult result;
    result.totalFaults = 0;
    result.totalHits = 0;
    
    std::vector<int> frames(numFrames, -1);
    std::vector<int> last_used(numFrames, -1);
    
    for (size_t step = 0; step < referenceString.size(); ++step) {
        int page = referenceString[step];
        PageStep pstep;
        pstep.page = page;
        
        auto it = std::find(frames.begin(), frames.end(), page);
        if (it != frames.end()) {
            pstep.fault = false;
            pstep.replaced = -1;
            int frame_idx = std::distance(frames.begin(), it);
            last_used[frame_idx] = step;
            std::ostringstream reason;
            reason << "Page " << page << ": hit — already in frame " << frame_idx;
            pstep.reason = reason.str();
            result.totalHits++;
        } else {
            pstep.fault = true;
            result.totalFaults++;
            
            auto empty_it = std::find(frames.begin(), frames.end(), -1);
            if (empty_it != frames.end()) {
                int frame_idx = std::distance(frames.begin(), empty_it);
                frames[frame_idx] = page;
                last_used[frame_idx] = step;
                pstep.replaced = -1;
                std::ostringstream reason;
                reason << "Page " << page << ": fault — loaded into empty frame " << frame_idx;
                pstep.reason = reason.str();
            } else {
                int lru_idx = 0;
                for (int i = 1; i < numFrames; ++i) {
                    if (last_used[i] < last_used[lru_idx]) {
                        lru_idx = i;
                    }
                }
                pstep.replaced = frames[lru_idx];
                frames[lru_idx] = page;
                int lru_time = last_used[lru_idx];
                last_used[lru_idx] = step;
                
                std::ostringstream reason;
                reason << "Page " << page << ": fault — replaced page " << pstep.replaced 
                       << " (least recently used, last used at step " << lru_time << ")";
                pstep.reason = reason.str();
            }
        }
        pstep.frames = frames;
        result.steps.push_back(pstep);
    }
    
    result.faultRate = referenceString.empty() ? 0 : static_cast<double>(result.totalFaults) / referenceString.size();
    return result;
}

PageResult runOptimal(std::vector<int> referenceString, int numFrames) {
    PageResult result;
    result.totalFaults = 0;
    result.totalHits = 0;
    
    std::vector<int> frames(numFrames, -1);
    
    for (size_t step = 0; step < referenceString.size(); ++step) {
        int page = referenceString[step];
        PageStep pstep;
        pstep.page = page;
        
        auto it = std::find(frames.begin(), frames.end(), page);
        if (it != frames.end()) {
            pstep.fault = false;
            pstep.replaced = -1;
            int frame_idx = std::distance(frames.begin(), it);
            std::ostringstream reason;
            reason << "Page " << page << ": hit — already in frame " << frame_idx;
            pstep.reason = reason.str();
            result.totalHits++;
        } else {
            pstep.fault = true;
            result.totalFaults++;
            
            auto empty_it = std::find(frames.begin(), frames.end(), -1);
            if (empty_it != frames.end()) {
                int frame_idx = std::distance(frames.begin(), empty_it);
                frames[frame_idx] = page;
                pstep.replaced = -1;
                std::ostringstream reason;
                reason << "Page " << page << ": fault — loaded into empty frame " << frame_idx;
                pstep.reason = reason.str();
            } else {
                int replace_idx = -1;
                int furthest = step;
                for (int i = 0; i < numFrames; ++i) {
                    int next_use = 1e9;
                    for (size_t j = step + 1; j < referenceString.size(); ++j) {
                        if (referenceString[j] == frames[i]) {
                            next_use = j;
                            break;
                        }
                    }
                    if (next_use > furthest) {
                        furthest = next_use;
                        replace_idx = i;
                    }
                }
                
                pstep.replaced = frames[replace_idx];
                frames[replace_idx] = page;
                
                std::ostringstream reason;
                if (furthest == 1e9) {
                    reason << "Page " << page << ": fault — replaced page " << pstep.replaced 
                           << " (not used again in future — optimal choice)";
                } else {
                    reason << "Page " << page << ": fault — replaced page " << pstep.replaced 
                           << " (used furthest in future at step " << furthest << " — optimal choice)";
                }
                pstep.reason = reason.str();
            }
        }
        pstep.frames = frames;
        result.steps.push_back(pstep);
    }
    
    result.faultRate = referenceString.empty() ? 0 : static_cast<double>(result.totalFaults) / referenceString.size();
    return result;
}
