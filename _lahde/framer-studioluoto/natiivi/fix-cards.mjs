// Patch in place: shadow cards inside a grid become one-cell grids so the card keeps its height and fills the row
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const NAMES = process.argv.slice(2)
try {
  let n = 0
  for (const w of await f.getNodesWithType('FrameNode')) {
    if (!NAMES.some(x => w.name === x + ' · varjolla')) continue
    if (w.isBreakpoint || (w.id.length > 9)) continue  // primary nodes only; breakpoints inherit
    await f.setAttributes(w.id, { layout: 'grid', gridColumnCount: 1, gridRowCount: 1, gridColumnWidthType: 'minmax', gridColumnMinWidth: 1, gridRowHeightType: 'auto', gridAlignment: 'start', gap: '0px' })
    for (const c of await f.getChildren(w.id)) {
      if (c.name === 'Varjo') continue
      await f.setAttributes(c.id, { height: 'fit-content', gridItemFillCellWidth: true, gridItemFillCellHeight: true, gridItemVerticalAlignment: 'start', gridItemHorizontalAlignment: 'start' })
    }
    n++
  }
  console.log('patched', n)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
