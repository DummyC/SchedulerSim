import React, { useState, useMemo } from 'react'
import ProcessTable from './components/ProcessTable'
import GanttChart from './components/GanttChart'

const defaultProcesses = [
  { id: 1, name: 'P1', arrival: 0, burst: 3 },
  { id: 2, name: 'P2', arrival: 1, burst: 4 },
  { id: 3, name: 'P3', arrival: 2, burst: 2 }
]

export default function App() {
  const [processes, setProcesses] = useState(defaultProcesses)
  const [contextSwitch, setContextSwitch] = useState(0)
  const [algorithm] = useState('FCFS')

  const schedule = useMemo(() => {
    // Implement FCFS scheduling
    const sorted = [...processes].sort((a, b) => a.arrival - b.arrival)
    const timeline = []
    let time = 0
    for (const p of sorted) {
      if (time < p.arrival) time = p.arrival
      timeline.push({ id: p.id, name: p.name, start: time, duration: p.burst })
      time += p.burst
      if (contextSwitch > 0) {
        time += contextSwitch
        timeline.push({ id: null, name: 'CS', start: time - contextSwitch, duration: contextSwitch, isContext: true })
      }
    }
    return timeline
  }, [processes, contextSwitch])

  return (
    <div className="app">
      <header>
        <h1>CPU scheduler</h1>
        <p>Type values into the table and the chart on the bottom will show how this runs</p>
      </header>

      <main>
        <section className="controls">
          <div className="control-row">
            <label>Algorithm:</label>
            <select value={algorithm} disabled>
              <option value="FCFS">FCFS</option>
            </select>
            <div className="alg-desc">
              <strong>First Come First Served</strong> will execute processes in the order in which they arrived
            </div>
          </div>

          <div className="control-row">
            <label>Context Switch Time:</label>
            <input type="number" min="0" step="0.1" value={contextSwitch} onChange={e => setContextSwitch(parseFloat(e.target.value || 0))} />
          </div>
        </section>

        <ProcessTable processes={processes} setProcesses={setProcesses} />

        <GanttChart schedule={schedule} />
      </main>

      <footer>
        <small>Recreated UI: FCFS Gantt chart</small>
      </footer>
    </div>
  )
}
