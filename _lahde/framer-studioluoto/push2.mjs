// node push2.mjs [page.html ...]  -- uploads code files and lays out every page in out/manifest.json (or only the ones given)
import { open } from './fx.mjs'
import fs from 'fs'

const manifest = JSON.parse(fs.readFileSync('out/manifest.json', 'utf8'))
const only = process.argv.slice(2)
const pages = Object.keys(manifest).filter(p => !only.length || only.includes(p))

function framerPath(p) {
  if (p === '404.html') return '/404'
  const s = '/' + p.replace(/index\.html$/, '').replace(/\/$/, '')
  return s === '/' ? '/' : s.replace(/\/$/, '')
}

const f = await open()
try {
  // code files: the shared base and every component the pages use
  const need = new Set(['LuotoBase'])
  for (const p of pages) for (const c of manifest[p]) need.add(c.name)
  const existing = await f.getCodeFiles()
  const byName = Object.fromEntries(existing.map(c => [c.name.replace(/\.tsx$/, ''), c]))
  const files = {}
  for (const name of need) {
    const code = fs.readFileSync(`out/${name}.tsx`, 'utf8')
    const ex = byName[name]
    files[name] = ex ? (ex.content === code ? ex : await ex.setFileContent(code)) : await f.createCodeFile(name + '.tsx', code)
  }
  console.log('code files', need.size)

  const allPages = await f.getNodesWithType('WebPageNode')
  for (const p of pages) {
    const path = framerPath(p)
    let page = allPages.find(x => x.path === path)
    if (!page) page = await f.createWebPage(path)
    let bps = await f.getChildren(page.id)
    let desk = bps.find(b => b.name === 'Desktop') || bps[0]
    if (!desk) desk = await f.createFrameNode({ name: 'Desktop', width: '1200px' }, page.id)
    for (const b of bps) if (b.id !== desk.id) await f.removeNode(b.id)
    for (const c of await f.getChildren(desk.id)) await f.removeNode(c.id)
    await f.setAttributes(desk.id, { layout: 'stack', stackDirection: 'vertical', stackAlignment: 'center', gap: '0px', padding: '0px', height: 'fit-content', backgroundColor: '#F4F1EA' })
    for (const c of manifest[p]) {
      const exp = files[c.name].exports.find(e => e.type === 'component')
      const inst = await f.addComponentInstance({ url: exp.insertURL, parentId: desk.id })
      await f.setAttributes(inst.id, { position: 'relative', top: null, left: null, width: '100%', height: 'fit-content', controls: c.controls })
    }
    await page.addBreakpoint(desk.id, { name: 'Tablet', width: 810 })
    await page.addBreakpoint(desk.id, { name: 'Phone', width: 390 })
    console.log('page', path, manifest[p].length)
  }
} catch (e) {
  console.log('ERR', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | '))
} finally { await f.disconnect() }
