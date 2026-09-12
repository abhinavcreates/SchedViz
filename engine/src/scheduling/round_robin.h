#pragma once
#include "../common.h"

// Run Round Robin scheduling with given time quantum
SchedulingResult runRoundRobin(std::vector<Process> processes, int quantum);
