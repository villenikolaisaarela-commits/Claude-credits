// Updates the four code components from comps.mjs (only the ones whose code changed)
import { connect } from 'framer-api'
import fs from 'fs'
import * as K from './comps.mjs'
const HERE = new URL('.', import.meta.url).pathname
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const AMAP = JSON.parse(fs.readFileSync(HERE + '../assets-map.json', 'utf8'))
try {
  const fonts = K.fontsCSS(AMAP)
  const SRC = { Liukurivi: K.liukurivi(fonts, AMAP['/assets/luoto/luoto-merkki-musta.svg']), Prosessivideo: K.video(), Kysymykset: K.ukk(fonts), DemoNappi: K.demonappi(fonts, 'ville@studioluoto.com', '+358451035362', '045 103 5362') }
  for (const c of await f.getCodeFiles()) {
    const name = c.name.replace(/\.tsx$/, '')
    if (SRC[name] && c.content !== SRC[name]) { await c.setFileContent(SRC[name]); console.log('updated', name) }
  }
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
