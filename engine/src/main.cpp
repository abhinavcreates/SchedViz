#include <iostream>
#include <stdexcept>
#include "json.hpp"
#include "scheduling/fcfs.h"
#include "scheduling/sjf.h"
#include "scheduling/srtf.h"
#include "scheduling/round_robin.h"
#include "scheduling/priority.h"
#include "memory/allocation.h"
#include "memory/page_replacement.h"

using json = nlohmann::json;

json schedulingResultToJson(const SchedulingResult& result) {
    json j;
    j["timeline"] = json::array();
    for (const auto& t : result.timeline) {
        j["timeline"].push_back({
            {"id", t.id},
            {"start", t.start},
            {"end", t.end},
            {"reason", t.reason}
        });
    }
    j["processes"] = json::array();
    for (const auto& p : result.metrics) {
        j["processes"].push_back({
            {"id", p.id},
            {"arrival", p.arrival},
            {"burst", p.burst},
            {"completion", p.completion},
            {"turnaround", p.turnaround},
            {"waiting", p.waiting}
        });
    }
    j["avgTurnaround"] = result.avgTurnaround;
    j["avgWaiting"] = result.avgWaiting;
    return j;
}

json allocationResultToJson(const AllocationResult& result) {
    json j;
    j["blocks"] = json::array();
    for (size_t i = 0; i < result.blocks.size(); ++i) {
        j["blocks"].push_back({
            {"index", i},
            {"originalSize", result.blocks[i].originalSize},
            {"remaining", result.blocks[i].remaining},
            {"allocatedTo", result.blocks[i].allocatedTo}
        });
    }
    j["allocations"] = json::array();
    for (const auto& a : result.allocations) {
        j["allocations"].push_back({
            {"id", a.id},
            {"size", a.size},
            {"blockIndex", a.blockIndex},
            {"status", a.status}
        });
    }
    j["totalFragmentation"] = result.totalFragmentation;
    return j;
}

json pageResultToJson(const PageResult& result) {
    json j;
    j["steps"] = json::array();
    for (const auto& s : result.steps) {
        j["steps"].push_back({
            {"page", s.page},
            {"frames", s.frames},
            {"fault", s.fault},
            {"replaced", s.replaced},
            {"reason", s.reason}
        });
    }
    j["totalFaults"] = result.totalFaults;
    j["totalHits"] = result.totalHits;
    j["faultRate"] = result.faultRate;
    return j;
}

int main() {
    try {
        json input;
        std::cin >> input;
        
        std::string module = input.at("module").get<std::string>();
        std::string algorithm = input.at("algorithm").get<std::string>();
        
        if (module == "cpu") {
            std::vector<Process> processes;
            for (auto& p : input.at("processes")) {
                processes.push_back({
                    p.at("id").get<std::string>(),
                    p.at("arrival").get<int>(),
                    p.at("burst").get<int>(),
                    p.value("priority", 0)
                });
            }
            int quantum = input.value("quantum", 2);
            
            SchedulingResult result;
            if (algorithm == "fcfs")         result = runFCFS(processes);
            else if (algorithm == "sjf")      result = runSJF(processes);
            else if (algorithm == "srtf")     result = runSRTF(processes);
            else if (algorithm == "rr")       result = runRoundRobin(processes, quantum);
            else if (algorithm == "priority_np") result = runPriorityNP(processes);
            else if (algorithm == "priority_p")  result = runPriorityP(processes);
            else throw std::runtime_error("Unknown CPU algorithm: " + algorithm);
            
            std::cout << schedulingResultToJson(result).dump() << std::endl;
            
        } else if (module == "memory") {
            std::vector<int> blockSizes = input.at("blocks").get<std::vector<int>>();
            std::vector<MemoryProcess> procs;
            for (auto& p : input.at("processes")) {
                procs.push_back({ p.at("id").get<std::string>(), p.at("size").get<int>() });
            }
            AllocationResult result;
            if (algorithm == "firstfit")      result = runFirstFit(blockSizes, procs);
            else if (algorithm == "bestfit")  result = runBestFit(blockSizes, procs);
            else if (algorithm == "worstfit") result = runWorstFit(blockSizes, procs);
            else throw std::runtime_error("Unknown memory algorithm: " + algorithm);
            
            std::cout << allocationResultToJson(result).dump() << std::endl;
            
        } else if (module == "page") {
            std::vector<int> refStr = input.at("referenceString").get<std::vector<int>>();
            int frames = input.at("frames").get<int>();
            
            PageResult result;
            if (algorithm == "fifo")          result = runFIFO(refStr, frames);
            else if (algorithm == "lru")      result = runLRU(refStr, frames);
            else if (algorithm == "optimal")  result = runOptimal(refStr, frames);
            else throw std::runtime_error("Unknown page algorithm: " + algorithm);
            
            std::cout << pageResultToJson(result).dump() << std::endl;
            
        } else {
            throw std::runtime_error("Unknown module: " + module);
        }
        
    } catch (const std::exception& e) {
        std::cerr << "{\"error\": \"" << e.what() << "\"}" << std::endl;
        return 1;
    }
    
    return 0;
}
