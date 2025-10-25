# Shared Lab Server CPU Time Simulation

This is a small React + Vite project that simulates a laboratory server running multiple VMs and containerized workloads with a mix of interactive (short) and batch (long) tasks. 

- Compare MLFQ, Preemptive Priority, and Round Robin CPU scheduler algorithms
- Visualize gantt chart of CPU time slices, and response time vs quantum plot
- Measure average response times of processes, throughput, CPU utilization, and number of context switches

## Quick Start
Already available at https://cpu.dummycore.top

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

The app will open on the port that Vite chooses (usually http://localhost:5173).

## Running the simulation

Open the app in your browser. The UI contains four main sections:

- Gantt Chart — visualizes scheduled CPU slices per process.
- Metrics — average response times (interactive / batch), throughput, CPU utilization, and context-switch count.
- Response Time vs Quantum — a plot (Round Robin only) showing average response vs RR quantum.
- Processes — editable table of processes (name, arrival, burst, priority). Use the "Add Process" and "Randomize" buttons to modify the process set.

Make changes in the Processes table and the chart/metrics update live.

### Algorithms available

- Round Robin — configurable quantum (Time Quantum field). Response plot shown when this algorithm is selected.
- Preemptive Priority — uses the `priority` field in the processes table (lower value => higher priority).
- MLFQ — Multi-Level Feedback Queue; configure quanta with the comma-separated field shown when MLFQ is selected.

### Context switch time

Set the Context Switch Time field (float). Context switches are counted even when the configured switch time is 0.

## Reproducing metrics and tables

A helper script is included to compute metrics programmatically for the default process set.

Run it with Node (14+ recommended):

```bash
node scripts/compute_metrics.mjs
```

The script prints a Markdown table with Avg response (interactive), Avg response (batch), Throughput, CPU utilization, and Context switches for each algorithm. You can modify `scripts/compute_metrics.mjs` to sweep parameters and export CSV/JSON if you need charts for reports.

## Build for production

To build a production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Troubleshooting

- If you see PostCSS/Tailwind errors, ensure you ran `npm install` and have a compatible Node version. Tailwind is used for some styling; the project contains a fallback CSS so it will run even if Tailwind processing is not performed.
- If Vite chooses a different port, check the terminal output for the correct local URL (e.g., http://localhost:5174).
- If the `node scripts/compute_metrics.mjs` script warns about ESM/CommonJS, you can add `"type": "module"` to `package.json` or run with `node --input-type=module` depending on your Node version.

## Development notes

- Default processes are stored in `src/defaultProcesses.json`.
- Scheduling algorithms are in `src/algorithms/` and are implemented as small, self-contained functions. You can add or tune algorithms there.
- The Gantt rendering is in `src/components/GanttChart.jsx`, the process table in `src/components/ProcessTable.jsx`, the metrics panel in `src/components/MetricsPanel.jsx`, and the response plot in `src/components/ResponsePlot.jsx`.


