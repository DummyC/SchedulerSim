import fs from 'fs'
import path from 'path'

const root = path.resolve(new URL('.', import.meta.url).pathname, '..')
const defaultsPath = path.join(root, 'src', 'defaultProcesses.json')
const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'))

const rr = (await import('../src/algorithms/roundRobin.js')).default
const pp = (await import('../src/algorithms/preemptivePriority.js')).default
const mlfq = (await import('../src/algorithms/mlfq.js')).default

function summarize(schedule, processes) {
  const sched = [...schedule].sort((a, b) => a.start - b.start)
  const firstStart = new Map()
  sched.forEach(s => { if (s.processId != null && !firstStart.has(s.processId)) firstStart.set(s.processId, s.start) })
  const response = []
  for (const p of processes) {
    const fs = firstStart.get(p.id)
    if (fs == null) continue
    response.push({ id: p.id, response: fs - (p.arrival || 0), burst: p.burst })
  }

  const interactive = response.filter(r => r.burst <= 2)
  const batch = response.filter(r => r.burst > 2)
  const avg = arr => arr.length ? arr.reduce((s, x) => s + x.response, 0) / arr.length : 0

  const totalRun = sched.reduce((s, e) => s + (e.duration || 0), 0)
  const busy = sched.filter(s => s.processId != null).reduce((s, e) => s + e.duration, 0)
  const utilization = totalRun > 0 ? (busy / totalRun) * 100 : 0

  let contextCount = 0
  let last = null
  for (const s of sched) {
    const cur = s.processId
    if (last == null && cur != null) { last = cur; continue }
    if (cur !== last) { contextCount += 1; last = cur }
  }

  // compute completed jobs: processes that have remaining <= 0 in schedule
  // to determine completions, we can examine when remaining reaches zero; simpler: sum unique processes that appear fully
  const completed = new Set(sched.filter(s => s.processId != null).map(s => s.processId))
  const jobsCompleted = completed.size

  return {
    avgInteractive: avg(interactive),
    avgBatch: avg(batch),
    throughput: totalRun > 0 ? (jobsCompleted / totalRun) : 0,
    utilization: utilization,
    contextSwitches: contextCount
  }
}

function printRow(alg, metrics) {
  console.log(`| ${alg} | ${metrics.avgInteractive.toFixed(2)} | ${metrics.avgBatch.toFixed(2)} | ${metrics.throughput.toFixed(2)} | ${metrics.utilization.toFixed(1)}% | ${metrics.contextSwitches} |`)
}

console.log('# Metrics summary for default processes')
console.log('\nDefault processes:')
defaults.forEach(p => console.log(`- ${p.name}: arrival=${p.arrival}, burst=${p.burst}, priority=${p.priority}`))

console.log('\n| Algorithm | Avg resp (interactive) | Avg resp (batch) | Throughput | CPU util | Context switches |')
console.log('|---|---:|---:|---:|---:|---:|')

const rrSched = rr(defaults, { quantum: 2, contextSwitch: 0 })
printRow('Round Robin (q=2)', summarize(rrSched, defaults))

const ppSched = pp(defaults, { contextSwitch: 0 })
printRow('Preemptive Priority', summarize(ppSched, defaults))

const mlfqSched = mlfq(defaults, { quanta: [1,2,4], contextSwitch: 0 })
printRow('MLFQ (1,2,4)', summarize(mlfqSched, defaults))

console.log('\nRun `node scripts/compute_metrics.mjs` (Node 14+) to regenerate this table locally.')
