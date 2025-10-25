import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import rr from '../algorithms/roundRobin'

function computeAvgResponse(schedule, processes) {
  const first = new Map()
  schedule.forEach(s => {
    if (s.processId == null) return
    if (!first.has(s.processId)) first.set(s.processId, s.start)
  })
  const vals = []
  for (const p of processes) {
    const fs = first.get(p.id)
    if (fs == null) continue
    vals.push(fs - p.arrival)
  }
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export default function ResponsePlot({ processes = [], contextSwitch = 0, maxQuantum = 10 }) {
  const data = useMemo(() => {
    const qs = []
    for (let q = 0.5; q <= maxQuantum; q += 0.5) qs.push(Number(q.toFixed(2)))
    return qs.map(q => {
      const sched = rr(processes, { quantum: q, contextSwitch })
      return { q, avg: computeAvgResponse(sched, processes) }
    })
  }, [processes, contextSwitch, maxQuantum])

  return (
    <div className="metric-card p-3">
      <div className="text-sm text-gray-400 mb-2">Avg Response vs Quantum (RR)</div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#0b1220" />
            <XAxis dataKey="q" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="avg" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background: '#0b1220', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.04)', padding: 8, borderRadius: 6, boxShadow: '0 6px 18px rgba(2,6,23,0.6)' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Quantum: {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: '#e6eef8' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: p.color || '#60a5fa', marginRight: 8, verticalAlign: 'middle' }} />
          {p.name || p.dataKey}: {typeof p.value === 'number' ? p.value.toFixed(2) : String(p.value)}
        </div>
      ))}
    </div>
  )
}
