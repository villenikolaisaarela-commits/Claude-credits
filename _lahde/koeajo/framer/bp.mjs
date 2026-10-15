import { open } from './fx.mjs'
const f = await open()
try {
  const page = (await f.getNodesWithType('WebPageNode'))[0]
  const kids = await f.getChildren(page.id); console.log('breakpoints before', kids.map(k => k.name + ' ' + k.width).join(', '))
  if (!kids.find(k => k.name === 'Tablet')) await page.addBreakpoint('WQLkyLRf1', { name: 'Tablet', width: 810 })
  if (!kids.find(k => k.name === 'Phone')) await page.addBreakpoint('WQLkyLRf1', { name: 'Phone', width: 390 })
  const after = await f.getChildren(page.id); console.log('after', after.map(k => k.name + ' ' + k.id + ' ' + k.width).join(', '))
  const phone = after.find(k => k.name === 'Phone')
  const r = await f.screenshot(phone.id, { format: 'jpeg', quality: 75 }); (await import('fs')).writeFileSync(process.argv[2], r.data)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
