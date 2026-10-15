import { open } from './fx.mjs'
import fs from 'fs'
const list = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean)
const mapFile = './assets-map.json'
const map = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : {}
const f = await open()
try {
  for (const p of list) {
    if (map[p]) continue
    try {
      const a = await f.uploadFile({ file: 'https://www.studioluoto.com' + encodeURI(p), name: p.split('/').pop() })
      map[p] = a.url; console.log('ok', p, a.url)
    } catch (e) { console.log('ERR', p, e.message) }
    fs.writeFileSync(mapFile, JSON.stringify(map, null, 1))
  }
} finally { await f.disconnect() }
console.log('mapped', Object.keys(map).length)
