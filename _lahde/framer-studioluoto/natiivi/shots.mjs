import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const [path, out, which] = process.argv.slice(2)
try {
  const page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === path)
  for (const b of await f.getChildren(page.id)) {
    if (which && !which.split(',').includes(b.name)) continue
    let i = 0
    for (const c of await f.getChildren(b.id)) {
      if (c.name === 'Ylätunniste') continue
      try {
        const s = await f.screenshot(c.id, { format: 'jpeg', quality: 70, scale: b.name === 'Phone' ? 1 : 0.5 })
        fs.writeFileSync(`${out}-${b.name}-${String(i).padStart(2, '0')}.jpg`, s.data); i++
      } catch (e) { console.log('skip', c.name, e.message.slice(0, 60)) }
    }
    console.log(b.name, i)
  }
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
