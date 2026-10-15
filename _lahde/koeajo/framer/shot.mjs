import { open } from './fx.mjs'
import fs from 'fs'
const f = await open()
try {
  for (const c of await f.getChildren('WQLkyLRf1')) console.log(c.name, c.id)
  const r = await f.screenshot('WQLkyLRf1', { format: 'jpeg', quality: 80 })
  fs.writeFileSync(process.argv[2], r.data); console.log('saved', r.mimeType, r.data.length)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
