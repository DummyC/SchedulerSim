import React, { useEffect, useState, useMemo } from 'react'
import ProcessTable from './components/ProcessTable'
import GanttChart from './components/GanttChart'
import MetricsPanel from './components/MetricsPanel'
import ResponsePlot from './components/ResponsePlot'

import rr from './algorithms/roundRobin'
import pp from './algorithms/preemptivePriority'
import mlfq from './algorithms/mlfq'

import defaults from './defaultProcesses.json'

const ALGORITHMS = {
  'Round Robin': rr,
  'Preemptive Priority': pp,
  'MLFQ': mlfq
}

export default function App() {
  const [processes, setProcesses] = useState([])
  const [contextSwitch, setContextSwitch] = useState(0)
  const [algorithm, setAlgorithm] = useState('Round Robin')
  const [quantum, setQuantum] = useState(2)
  const [mlfqQuanta, setMlfqQuanta] = useState([1,2,4])

  useEffect(() => {
    // load defaults on first render
    setProcesses(defaults.map(d => ({ ...d })))
  }, [])

  const schedule = useMemo(() => {
    const algo = ALGORITHMS[algorithm]
    if (!algo) return []
    const opts = { contextSwitch }
    if (algorithm === 'Round Robin') opts.quantum = Number(quantum)
    if (algorithm === 'MLFQ') opts.quanta = mlfqQuanta.map(Number)
    return algo(processes, opts)
  }, [processes, algorithm, contextSwitch, quantum, mlfqQuanta])

  return (
    <div className="app">
      <header className="mb-4">
        <h1 style={{ fontSize: 28, margin: 0, color: '#e6eef8' }}>Shared Lab Server CPU Time</h1>
        <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>Type values into the table and the chart will show how this runs</p>
      </header>

      <main>
        <section className="controls">
          <div className="control-row">
            <label>Algorithm:</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              {Object.keys(ALGORITHMS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="control-row">
            <label>Context Switch Time:</label>
            <input type="number" min="0" step="0.1" value={contextSwitch} onChange={e => setContextSwitch(parseFloat(e.target.value || 0))} />
          </div>

          {algorithm === 'Round Robin' && (
            <div className="control-row">
              <label>Time Quantum:</label>
              <input type="number" min="0.1" step="0.1" value={quantum} onChange={e => setQuantum(Number(e.target.value))} />
            </div>
          )}

          {algorithm === 'MLFQ' && (
            <div className="control-row">
              <label>MLFQ Quanta (comma separated):</label>
              <input type="text" value={mlfqQuanta.join(',')} onChange={e => setMlfqQuanta(e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)))} />
            </div>
          )}
        </section>

        <div className="space-y-6">
          <div>
            <GanttChart schedule={schedule} processes={processes} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricsPanel schedule={schedule} processes={processes} contextSwitch={contextSwitch} />
            {algorithm === 'Round Robin' && (
              <ResponsePlot processes={processes} contextSwitch={contextSwitch} maxQuantum={8} />
            )}
          </div>

          <div className="mt-6">
            <ProcessTable processes={processes} setProcesses={setProcesses} />
          </div>
        </div>
      </main>

      <footer />
    </div>
  )
}
