import React, { useMemo } from 'react'

export default function MetricsPanel({ schedule = [], processes = [], contextSwitch = 0 }) {
  // compute average response time for short (interactive) vs long (batch)
  const metrics = useMemo(() => {
    // sort schedule by start time
    const sched = [...schedule].sort((a, b) => a.start - b.start)

    // first-start per process
    const firstStart = new Map()
    sched.forEach(s => {
      if (s.processId != null && !firstStart.has(s.processId)) firstStart.set(s.processId, s.start)
    })

    const responseTimes = []
    for (const p of processes) {
      const fs = firstStart.get(p.id)
      if (fs == null) {
        // if no entry, skip
        continue
      }
      responseTimes.push({ id: p.id, response: fs - (p.arrival || 0), burst: p.burst })
    }

    const interactive = responseTimes.filter(r => r.burst <= 2)
    const batch = responseTimes.filter(r => r.burst > 2)
    const avg = arr => arr.length ? arr.reduce((s, x) => s + x.response, 0) / arr.length : 0

    // utilization and throughput
    const totalRun = sched.reduce((s, e) => s + (e.duration || 0), 0)
    const busy = sched.filter(s => s.processId != null).reduce((s, e) => s + e.duration, 0)
    const utilization = totalRun > 0 ? (busy / totalRun) * 100 : 0

    // count context switches by scanning transitions between scheduled entries
    let contextCount = 0
    let lastProc = null
    for (const s of sched) {
      const cur = s.processId
      if (lastProc == null && cur != null) {
        lastProc = cur
        continue
      }
      if (cur !== lastProc) {
        // a switch occurred (including if cur is null or lastProc is null)
        contextCount += 1
        lastProc = cur
      }
    }

    return {
      avgInteractive: avg(interactive),
      avgBatch: avg(batch),
      throughput: processes.length > 0 ? (busy / (Math.max(1, totalRun))) : 0,
      utilization: utilization.toFixed(1),
      contextSwitches: contextCount
    }
  }, [schedule, processes])

  return (
    <div className="metric-card p-4 grid grid-cols-2 gap-4">
      <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
        <div className="text-xs text-slate-400">Avg response (interactive ≤2)</div>
        <div className="text-2xl font-semibold text-white">{metrics.avgInteractive.toFixed(2)}</div>
      </div>

      <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
        <div className="text-xs text-slate-400">Avg response (batch &gt;2)</div>
        <div className="text-2xl font-semibold text-white">{metrics.avgBatch.toFixed(2)}</div>
      </div>

      <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
        <div className="text-xs text-slate-400">Throughput (work units / time)</div>
        <div className="text-2xl font-semibold text-white">{metrics.throughput.toFixed(2)}</div>
      </div>

      <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
        <div className="text-xs text-slate-400">CPU Utilization</div>
        <div className="text-2xl font-semibold text-white">{metrics.utilization}%</div>
      </div>

  <div className="col-span-2 mt-2 mb-8 text-sm text-slate-300">Context Switches: <span className="context-count">{metrics.contextSwitches}</span></div>
    </div>
  )
}
