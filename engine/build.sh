#!/bin/bash
# SchedViz Engine Build Script
# Requires: g++ with C++17 support, curl (for downloading json.hpp)
# On Windows: use WSL (Ubuntu) or MinGW/MSYS2
# On macOS/Linux: run directly

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "[SchedViz Engine] Starting build..."

# Step 1: Download nlohmann/json if not present (header-only library)
if [ ! -f "include/json.hpp" ]; then
    echo "[SchedViz Engine] Downloading nlohmann/json v3.11.3..."
    mkdir -p include
    curl -sL https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp \
         -o include/json.hpp
    echo "[SchedViz Engine] json.hpp downloaded."
else
    echo "[SchedViz Engine] json.hpp already present, skipping download."
fi

# Step 2: Create output directory
mkdir -p bin

# Step 3: Compile all source files into a single binary
echo "[SchedViz Engine] Compiling..."
g++ -std=c++17 -O2 -Wall \
    -I include \
    src/main.cpp \
    src/scheduling/fcfs.cpp \
    src/scheduling/sjf.cpp \
    src/scheduling/srtf.cpp \
    src/scheduling/round_robin.cpp \
    src/scheduling/priority.cpp \
    src/memory/allocation.cpp \
    src/memory/page_replacement.cpp \
    -o bin/schedviz_engine

echo "[SchedViz Engine] Build successful! Binary at: engine/bin/schedviz_engine"
echo ""
echo "Test with:"
echo "  echo '{\"module\":\"cpu\",\"algorithm\":\"fcfs\",\"processes\":[{\"id\":\"P1\",\"arrival\":0,\"burst\":5},{\"id\":\"P2\",\"arrival\":1,\"burst\":3}],\"quantum\":2}' | ./bin/schedviz_engine"
