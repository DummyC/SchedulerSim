// Round Robin scheduling (preemptive)
export default function roundRobin(processes, { quantum = 1, contextSwitch = 0 } = {}) {
  // clone and prepare
  const procs = processes.map(p => ({ ...p, remaining: p.burst }))
  const timeline = []
  let time = 0
  const ready = []
  const byArrival = [...procs].sort((a, b) => a.arrival - b.arrival)
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
      // jump to next arrival
      time = Math.max(time, byArrival[ai].arrival)
      enqueueArrivals()
      continue
    }

    const cur = ready.shift()
    const run = Math.min(quantum, cur.remaining)
    // record run
    timeline.push({ processId: cur.id, name: cur.name, start: time, duration: run })
    time += run
    cur.remaining -= run
    // arrivals during run
    enqueueArrivals()

    if (cur.remaining > 0) {
      // requeue
      ready.push(cur)
    }

    if (contextSwitch > 0) {
      // only add context switch if there will be more work and next will be different
      const hasMore = ready.length > 0 || ai < byArrival.length
      if (hasMore) {
        timeline.push({ processId: null, name: 'CS', start: time, duration: contextSwitch, isContext: true })
        time += contextSwitch
        enqueueArrivals()
      }
    }
  }

  return timeline
}
