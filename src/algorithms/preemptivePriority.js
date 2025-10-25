// Preemptive Priority scheduling
export default function preemptivePriority(processes, { contextSwitch = 0 } = {}) {
  // lower priority value = higher priority
  const procs = processes.map(p => ({ ...p, remaining: p.burst }))
  const timeline = []
  let time = 0
  const byArrival = [...procs].sort((a, b) => a.arrival - b.arrival)
  const ready = []
  let ai = 0

  const enqueueArrivals = () => {
    while (ai < byArrival.length && byArrival[ai].arrival <= time) {
      ready.push(byArrival[ai])
      ai++
    }
  }

  enqueueArrivals()
  while (ready.length > 0 || ai < byArrival.length) {
    if (ready.length === 0) {
      time = Math.max(time, byArrival[ai].arrival)
      enqueueArrivals()
      continue
    }

    // pick highest priority (lowest value), tie-break arrival then id
    ready.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.arrival - b.arrival || a.id - b.id)
    const cur = ready[0]
    // run 1 unit and re-evaluate (preemptive)
    const run = 1
    timeline.push({ processId: cur.id, name: cur.name, start: time, duration: run })
    time += run
    cur.remaining -= run
    enqueueArrivals()

    // remove finished
    if (cur.remaining <= 0) {
      const idx = ready.indexOf(cur)
      if (idx >= 0) ready.splice(idx, 1)
    }

    if (contextSwitch > 0) {
      const hasMore = ready.length > 0 || ai < byArrival.length || (cur.remaining > 0)
      if (hasMore) {
        timeline.push({ processId: null, name: 'CS', start: time, duration: contextSwitch, isContext: true })
        time += contextSwitch
        enqueueArrivals()
      }
    }
  }

  return timeline
}
