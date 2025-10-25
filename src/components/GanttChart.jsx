import React from 'react'

function calcExtent(schedule) {
  if (!schedule.length) return [0, 0]
  const end = schedule.reduce((e, s) => Math.max(e, s.start + s.duration), 0)
  return [0, end]
}

export default function GanttChart({ schedule }) {
  const [start, end] = calcExtent(schedule)
  const width = 800
  const height = 120
  const scale = end > start ? width / (end - start) : 1

  return (
    <div className="gantt">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <defs>
          <style>{`.label{font:12px sans-serif;fill:#111}`}</style>
        </defs>

        <g transform="translate(0,20)">
          {schedule.map((s, i) => {
            const x = (s.start - start) * scale
            const w = Math.max(1, s.duration * scale)
            const isCS = s.isContext
            const color = isCS ? '#ccc' : `hsl(${(s.id || 0) * 65 % 360} 60% 60%)`
            return (
              <g key={i}>
                <rect x={x} y={0} width={w} height={40} fill={color} stroke="#333" />
                <text x={x + Math.max(4, w / 2)} y={24} className="label" textAnchor="middle">{s.name}</text>
                <text x={x} y={58} className="label">{s.start}</text>
              </g>
            )
          })}
          <text x={width - 10} y={58} className="label" textAnchor="end">{end}</text>
        </g>
      </svg>
    </div>
  )
}
