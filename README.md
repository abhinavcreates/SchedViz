# SchedViz — OS CPU Scheduling & Memory Management Simulator

A full-stack portfolio project for BCA students demonstrating OS algorithm implementations with animated visualizations.

**Tech Stack:** C++ (algorithm engine) · Node.js + Express (REST API) · React + Vite + Tailwind CSS (frontend) · MongoDB Atlas (history storage) · Framer Motion (animations)

---

## Project Structure

```
SchedViz/
├── engine/          # C++ algorithm engine (compiled to a standalone binary)
│   ├── src/
│   │   ├── main.cpp                      # Entry point — JSON dispatcher
│   │   ├── common.h                      # Shared data structures
│   │   ├── scheduling/
│   │   │   ├── fcfs.cpp / .h             # First Come First Served
│   │   │   ├── sjf.cpp / .h              # Shortest Job First (non-preemptive)
│   │   │   ├── srtf.cpp / .h             # Shortest Remaining Time First (preemptive)
│   │   │   ├── round_robin.cpp / .h      # Round Robin
│   │   │   └── priority.cpp / .h         # Priority Scheduling (preemptive + non-preemptive)
│   │   └── memory/
│   │       ├── allocation.cpp / .h        # First Fit, Best Fit, Worst Fit
│   │       └── page_replacement.cpp / .h  # FIFO, LRU, Optimal
│   ├── include/     # json.hpp (downloaded by build.sh)
│   ├── bin/         # Compiled binary output (gitignored)
│   └── build.sh     # Build script
├── server/          # Node.js + Express API
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/        # auth.js, simulate.js, history.js
│   │   ├── models/        # User.js, Simulation.js
│   │   ├── middleware/    # auth.js (JWT verification)
│   │   └── utils/         # engine.js (C++ subprocess runner)
│   ├── .env.example
│   └── package.json
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # CPUScheduling, MemoryManagement, History, Login, Signup
│   │   ├── components/    # GanttChart, ProcessTable, MemoryBlocks, FrameTable, etc.
│   │   ├── context/       # AuthContext (JWT state)
│   │   ├── hooks/         # useSimulate (API call hook)
│   │   └── api/           # Axios client
│   └── package.json
└── README.md
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| g++ | ≥ 9.0 | C++17 support required |
| Node.js | ≥ 18.x | LTS recommended |
| npm | ≥ 9.x | Comes with Node.js |
| curl | any | For downloading json.hpp |
| MongoDB Atlas | — | Free tier works fine |

### Windows Users

The C++ build script (`build.sh`) requires a Unix shell. Choose one of:

- **WSL (Recommended):** Install WSL2 with Ubuntu from the Microsoft Store. Run all `engine/` commands inside WSL.
- **MinGW/MSYS2:** Install [MSYS2](https://www.msys2.org/), then install `mingw-w64-x86_64-gcc` via `pacman`. Run `build.sh` in the MSYS2 shell.
- **Git Bash:** Includes `bash` and `curl`. Open `engine/` in Git Bash and run `bash build.sh`.

> **Note:** The Node.js server and React client run natively on Windows — only the C++ compilation step needs a Unix shell.

---

## Setup Instructions

### Step 1 — Compile the C++ Engine

```bash
cd engine
bash build.sh
```

This will:
1. Download `nlohmann/json` v3.11.3 into `engine/include/json.hpp` (if not already present)
2. Compile all C++ source files into `engine/bin/schedviz_engine`

**Verify it works:**
```bash
echo '{"module":"cpu","algorithm":"fcfs","processes":[{"id":"P1","arrival":0,"burst":5},{"id":"P2","arrival":1,"burst":3}],"quantum":2}' | ./bin/schedviz_engine
```

Expected output: a JSON object with `timeline`, `processes`, `avgTurnaround`, `avgWaiting`.

---

### Step 2 — Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# MongoDB Atlas connection string
# Get this from: Atlas Dashboard → Connect → Drivers → Node.js
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/schedviz?retryWrites=true&w=majority

# JWT secret — use any long random string
JWT_SECRET=change_this_to_a_long_random_string_in_production

# Server port
PORT=5000

# Path to the compiled engine binary (relative to server/src/utils/engine.js)
ENGINE_PATH=../../engine/bin/schedviz_engine
```

**How to get your MongoDB Atlas URI:**
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier)
2. Create a cluster → click Connect → Drivers → Node.js
3. Copy the connection string and replace `<password>` with your DB user's password
4. Create a database user under Security → Database Access

---

### Step 3 — Install & Run the Server

```bash
cd server
npm install
npm run dev       # development (with nodemon auto-reload)
# or
npm start         # production
```

Server starts at `http://localhost:5000`.

**Test the health endpoint:**
```bash
curl http://localhost:5000/api/health
# → { "status": "ok", "timestamp": "..." }
```

---

### Step 4 — Install & Run the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`. It proxies all `/api/*` requests to `http://localhost:5000`.

Open your browser at **http://localhost:3000**.

---

## API Reference

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/signup` | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | — (requires Bearer token) | `{ id, email }` |

### Simulation

All simulation endpoints accept an optional `Authorization: Bearer <token>` header. If provided, results are saved to history.

**CPU Scheduling** — `POST /api/simulate/cpu`
```json
{
  "algorithm": "srtf",
  "processes": [
    { "id": "P1", "arrival": 0, "burst": 6, "priority": 0 },
    { "id": "P2", "arrival": 2, "burst": 4, "priority": 0 }
  ],
  "quantum": 2
}
```

Algorithms: `fcfs` | `sjf` | `srtf` | `rr` | `priority_np` | `priority_p`

**Memory Allocation** — `POST /api/simulate/memory`
```json
{
  "algorithm": "bestfit",
  "blocks": [100, 500, 200, 300, 600],
  "processes": [
    { "id": "P1", "size": 212 },
    { "id": "P2", "size": 417 }
  ]
}
```

Algorithms: `firstfit` | `bestfit` | `worstfit`

**Page Replacement** — `POST /api/simulate/page`
```json
{
  "algorithm": "lru",
  "frames": 3,
  "referenceString": [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]
}
```

Algorithms: `fifo` | `lru` | `optimal`

### History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/history` | Required | Last 5 simulations |
| DELETE | `/api/history/:id` | Required | Delete a simulation |

---

## Algorithm Correctness — Test Cases

Use these known inputs to verify algorithm correctness after compilation:

### FCFS
Input: P1(0,4), P2(1,3), P3(2,1)
Expected: WT = P1:0, P2:3, P3:6 | Avg WT = 3.0

### SJF (Non-preemptive)
Input: P1(0,6), P2(1,8), P3(2,7), P4(3,3)
Expected: Order = P1, P4, P3, P2 | Avg WT = 7.0

### SRTF
Input: P1(0,6), P2(2,4), P3(4,2)
Expected: P1 runs 0-2, P2 runs 2-4, P3 runs 4-6, P2 runs 6-8, P1 runs 8-12
Avg WT = (6 + 3 + 0) / 3 = 3.0

### Round Robin (q=2)
Input: P1(0,5), P2(1,3), P3(2,1)
Expected: P1(0-2), P2(2-4), P3(4-5), P1(5-7), P2(7-8), P1(8-9)

### Priority (Non-preemptive)
Input: P1(0,4,3), P2(1,3,1), P3(2,1,2)  (format: id, burst, priority)
Expected: P1(0-4), P2(4-7), P3(7-8) | Avg WT = (0+3+6)/3 = 3.0

---

## Gitignore Recommendations

Create a `.gitignore` in the project root:

```gitignore
# Engine binary
engine/bin/
engine/include/json.hpp

# Environment files
server/.env

# Node modules
node_modules/
server/node_modules/
client/node_modules/

# Build outputs
client/dist/

# OS files
.DS_Store
Thumbs.db
```

---

## Troubleshooting

**Engine binary not found**
→ Make sure you ran `bash build.sh` in the `engine/` directory and the binary exists at `engine/bin/schedviz_engine`.

**MongoDB connection error**
→ Check your `MONGO_URI` in `server/.env`. Make sure your IP is whitelisted in Atlas (Network Access → Add IP → Allow Access from Anywhere for development).

**Port already in use**
→ Change `PORT` in `server/.env` and update the Vite proxy target in `client/vite.config.js` accordingly.

**CORS errors in browser**
→ The Vite dev server proxies `/api/*` to the Express server, so CORS should not be an issue during development. If you're testing the API directly (e.g., with Postman), requests go directly to port 5000 and CORS is enabled server-side.

---

## License

MIT — free to use as a portfolio/educational project.
