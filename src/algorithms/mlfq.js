// Multi-Level Feedback Queue (simple implementation)
// queues: 0 (highest) -> 2 (lowest)
export default function mlfq(processes, { quanta = [1, 2, 4], contextSwitch = 0 } = {}) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst, queue: 0 }))
  const timeline = []
  const byArrival = [...procs].sort((a, b) => a.arrival - b.arrival)
  const queues = [[], [], []]
  let ai = 0
  let time = 0

  const enqueueArrivals = () => {
    while (ai < byArrival.length && byArrival[ai].arrival <= time) {
      const p = byArrival[ai]
      queues[0].push(p)
      ai++
    }
  }

  enqueueArrivals()
  while (queues.some(q => q.length > 0) || ai < byArrival.length) {
    if (queues.every(q => q.length === 0)) {
      time = Math.max(time, byArrival[ai].arrival)
      enqueueArrivals()
      continue
    }

    let curQueue = queues.findIndex(q => q.length > 0)
    const proc = queues[curQueue].shift()
    const quantum = quanta[Math.min(curQueue, quanta.length - 1)]
    const run = Math.min(quantum, proc.remaining)
    timeline.push({ processId: proc.id, name: proc.name, start: time, duration: run })
    time += run
    proc.remaining -= run
    enqueueArrivals()

    if (proc.remaining > 0) {
      // demote to lower queue
      proc.queue = Math.min(2, curQueue + 1)
      queues[proc.queue].push(proc)
    }

    if (contextSwitch > 0) {
      const hasMore = queues.some(q => q.length > 0) || ai < byArrival.length
      if (hasMore) {
        timeline.push({ processId: null, name: 'CS', start: time, duration: contextSwitch, isContext: true })
        time += contextSwitch
        enqueueArrivals()
      }
    }
  }

  return timeline
}
