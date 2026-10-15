import { open } from './fx.mjs'
import fs from 'fs'
const f = await open()
async function walk(id, fn) { for (const c of await f.getChildren(id)) { await fn(c); await walk(c.id, fn) } }
try {
  const h1 = (await f.getTextStyles()).find(s => s.name === 'DV H1')
  await h1.setAttributes({ breakpoints: [{ minWidth: 810, fontSize: '52px' }, { minWidth: 0, fontSize: '34px' }] })
  for (const t of await f.getNodesWithType('TextNode')) {
    if ((await t.getText()) === 'Arkkitehdit ja rakennesuunnittelijat samassa toimistossa Espoossa.') { await t.setText('Arkkitehdit ja rakenne­suunnittelijat samassa toimistossa Espoossa.'); await f.setAttributes(t.id, { inlineTextStyle: h1 }) }
  }
  for (const [bp, min] of [['QR3RJ2Em9', 300], ['PLYI_MSTM', 340]]) {
    await walk(bp, async c => { if (c.name === 'Polut' || c.name === 'Kaksi saraketta') { await f.setAttributes(c.id, { gridColumnMinWidth: min }); console.log('set', bp, c.name, c.id) } })
  }
  const r = await f.screenshot('QR3RJ2Em9', { format: 'jpeg', quality: 75 }); fs.writeFileSync(process.argv[2], r.data)
  const r2 = await f.screenshot('PLYI_MSTM', { format: 'jpeg', quality: 60 }); fs.writeFileSync(process.argv[3], r2.data)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
