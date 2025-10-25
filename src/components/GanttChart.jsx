import React, { useState, useRef, useEffect } from 'react'

function calcExtent(schedule) {
  if (!schedule.length) return [0, 0]
  const end = schedule.reduce((e, s) => Math.max(e, s.start + s.duration), 0)
  return [0, end]
}

export default function GanttChart({ schedule, processes = [] }) {
  const [start, end] = calcExtent(schedule)
  const width = 1000
  const laneHeight = 40
  const lanes = processes.map(p => p.id)
  const height = laneHeight * (lanes.length + 1) + 60
  const chartWidth = width - 160
  const scale = end > start ? chartWidth / (end - start) : 1

  const laneIndex = id => lanes.indexOf(id)

  const [hover, setHover] = useState(null)
  const containerRef = useRef()

  useEffect(() => {
    const onMove = e => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setHover(h => h ? { ...h, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top } : h)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const bars = schedule.map((s, i) => {
    const x = (s.start - start) * scale
    const w = Math.max(1, s.duration * scale)
    return { ...s, x, w, i }
  })

  // better palette with high contrast against dark background
  const palette = ['#2563eb','#f97316','#10b981','#ef4444','#8b5cf6','#06b6d4','#f59e0b','#7c3aed']

  return (
    <div className="gantt p-4" ref={containerRef} style={{ position: 'relative' }}>
      {hover && hover.data && (
        <div className="tooltip" style={{ left: hover.clientX + 12, top: hover.clientY + 12 }}>
          <div><strong>{hover.data.name}</strong></div>
          <div>Start: {hover.data.start}</div>
          <div>Len: {hover.data.duration}</div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <defs>
          <style>{`.label{font:12px sans-serif;fill:#cbd5e1}`}</style>
        </defs>

        <g transform="translate(120,30)">
          {/* vertical time grid */}
          {Array.from({ length: Math.ceil(end - start) + 1 }).map((_, t) => {
            const x = t * scale
            return <line key={t} x1={x} x2={x} y1={0} y2={lanes.length * laneHeight} stroke="#071029" />
          })}

          {/* process labels and lane lines */}
          {processes.map((p, i) => (
            <g key={p.id}>
              <text x={-12} y={i * laneHeight + laneHeight / 2 + 6} className="label" textAnchor="end">{p.name}</text>
              <line x1={0} x2={chartWidth} y1={i * laneHeight + laneHeight} y2={i * laneHeight + laneHeight} stroke="#071029" />
            </g>
          ))}

          {/* bars */}
          {bars.map((s, i) => {
            if (s.isContext || s.processId == null) {
              // context switch row
              return (
                <g key={`cs-${i}`}>
                  <rect x={s.x} y={lanes.length * laneHeight + 12} width={s.w} height={12} fill="#334155" stroke="#111827" rx={2} />
                </g>
              )
            }

            const li = laneIndex(s.processId)
            const color = palette[(s.processId - 1) % palette.length]
            // determine if text should be dark or light based on luminance
            const rgb = color.replace('#','')
            const r = parseInt(rgb.substring(0,2),16)
            const g = parseInt(rgb.substring(2,4),16)
            const b = parseInt(rgb.substring(4,6),16)
            const luminance = (0.299*r + 0.587*g + 0.114*b)/255
            const textColor = luminance > 0.6 ? '#0b1220' : '#ffffff'
            return (
              <g key={i}>
                <rect
                  x={s.x}
                  y={li * laneHeight + 4}
                  width={s.w}
                  height={laneHeight - 10}
                  fill={color}
                  stroke="#071025"
                  rx={4}
                  onMouseEnter={(e) => setHover({ data: s, clientX: e.clientX - containerRef.current.getBoundingClientRect().left, clientY: e.clientY - containerRef.current.getBoundingClientRect().top })}
                  onMouseLeave={() => setHover(null)}
                  style={{ transition: 'transform 120ms', cursor: 'pointer' }}
                />
                <text x={s.x + Math.max(8, s.w / 2)} y={li * laneHeight + (laneHeight / 2) + 4} className="label" textAnchor="middle" style={{ fill: textColor, fontWeight: 600 }}>{s.name}</text>
              </g>
            )
          })}

          {/* end time */}
          <text x={Math.max(0, (end - start) * scale) + 4} y={lanes.length * laneHeight + 28} className="label">{end}</text>
        </g>
      </svg>
    </div>
  )
}
