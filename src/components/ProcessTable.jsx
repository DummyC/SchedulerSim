import React from 'react'

export default function ProcessTable({ processes, setProcesses }) {
  const update = (id, key, value) => {
    setProcesses(procs => procs.map(p => p.id === id ? { ...p, [key]: value } : p))
  }

  const add = () => {
    setProcesses(procs => {
      const max = procs.reduce((m, p) => Math.max(m, p.id), 0)
      return [...procs, { id: max + 1, name: `P${max + 1}`, arrival: 0, burst: 1, priority: 1 }]
    })
  }

  const remove = id => setProcesses(procs => procs.filter(p => p.id !== id))

  const randomizeAll = () => {
    setProcesses(procs => procs.map(p => ({
      ...p,
      arrival: Math.floor(Math.random() * 10),
      burst: Math.max(1, Math.floor(Math.random() * 6)),
      priority: Math.max(1, Math.floor(Math.random() * 5))
    })))
  }

  return (
    <div className="process-table">
      <div className="table-header">
        <div>Process</div>
        <div>Arrival</div>
        <div>Burst</div>
        <div>Priority</div>
        <div></div>
      </div>
      {processes.map(p => (
        <div className="table-row" key={p.id}>
          <input value={p.name} onChange={e => update(p.id, 'name', e.target.value)} />
          <input type="number" min="0" value={p.arrival} onChange={e => update(p.id, 'arrival', Number(e.target.value))} />
          <input type="number" min="0" value={p.burst} onChange={e => update(p.id, 'burst', Number(e.target.value))} />
          <input type="number" min="0" value={p.priority ?? 0} onChange={e => update(p.id, 'priority', Number(e.target.value))} />
          <button className="remove" onClick={() => remove(p.id)}>Remove</button>
        </div>
      ))}

      <div className="table-actions">
        <button className="btn btn-primary" onClick={add}>Add Process</button>
        <button className="btn btn-secondary" onClick={randomizeAll}>Randomize</button>
      </div>
    </div>
  )
}
