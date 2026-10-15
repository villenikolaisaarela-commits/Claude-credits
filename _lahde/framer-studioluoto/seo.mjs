import { open } from './fx.mjs'
import fs from 'fs'
const f = await open()
try {
  await f.setCustomCode({ html: fs.readFileSync('seo.html', 'utf8'), location: 'headEnd' })
  const cc = await f.getCustomCode(); console.log('headEnd', cc.headEnd && cc.headEnd.html && cc.headEnd.html.length, 'disabled', cc.headEnd && cc.headEnd.disabled)
  for (const cf of await f.getCodeFiles()) { if (cf.name.startsWith('Proto')) await cf.remove() }
  const r = await f.publish(); await f.deploy(r.deployment.id); console.log('published', r.deployment.id)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
