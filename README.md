# Shared Lab Server CPU Time Simulation

This is a small React + Vite project that simulates a laboratory server running multiple VMs and containerized workloads with a mix of interactive (short) and batch (long) tasks. 

- Compare MLFQ, Preemptive Priority, and Round Robin CPU scheduler algorithms
- Visualize gantt chart of CPU time slices, and response time vs quantum plot
- Measure average response times of processes, throughput, CPU utilization, and number of context switches

Quick start

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

The app will open on the port that Vite chooses (usually http://localhost:5173).

