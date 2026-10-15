import { open } from './fx.mjs'
const f = await open()
try {
  const r = await f.publish()
  console.log('published', JSON.stringify(r).slice(0, 400))
  const h = await f.deploy(r.deployment.id)
  console.log('deployed', JSON.stringify(h).slice(0, 400))
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
