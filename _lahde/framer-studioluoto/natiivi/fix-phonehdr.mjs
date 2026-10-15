// Patch in place: smaller logo and tighter header pill in the phone view of every page (set on the phone layers themselves)
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
try {
  let n = 0
  for (const page of await f.getNodesWithType('WebPageNode')) {
    const pho = (await f.getChildren(page.id)).find(b => b.name === 'Phone')
    if (!pho) continue
    const hdr = (await f.getChildren(pho.id)).find(c => c.name === 'Ylätunniste')
    if (!hdr) continue
    const val = (await f.getChildren(hdr.id)).find(c => c.name === 'Valikko')
    const lb = (await f.getChildren(val.id)).find(c => c.name === 'Logo')
    const logo = (await f.getChildren(lb.id))[0]
    await f.setAttributes(logo.id, { width: '108px', height: '16px' })
    await f.setAttributes(val.id, { gap: '10px', padding: '0px 8px 0px 16px' })
    const back = (await f.getChildren(lb.id))[0]
    if (back && back.width === '108px') n++; else console.log('not applied', page.path)
  }
  console.log('phone headers', n)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
