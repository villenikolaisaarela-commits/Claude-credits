// Studio Luoto: every page except the Finnish front page, built from Framer's own layers so every text can be edited on the canvas.
// node build-site.mjs <job...>   jobs: all | en | works-fi | works-en | project-fi-<slug|all> | project-en-<slug|all> | privacy-fi | privacy-en | terms-fi | terms-en | 404
// The Finnish front page (/) is never rebuilt here: it is edited by hand in Framer, and changes to it are made as small patches.
import { connect } from 'framer-api'
import fs from 'fs'
import * as K from './comps.mjs'

const HERE = new URL('.', import.meta.url).pathname
const PROJECT = 'https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj'
const KEY = process.env.FRAMER_API_KEY
const AMAP = JSON.parse(fs.readFileSync(HERE + '../assets-map.json', 'utf8'))
const DATA = { fi: JSON.parse(fs.readFileSync(HERE + 'data-fi.json', 'utf8')), en: JSON.parse(fs.readFileSync(HERE + 'data-en.json', 'utf8')) }
const SITE = JSON.parse(fs.readFileSync(HERE + 'site-data.json', 'utf8'))

const C = { ink: '#0F0F0E', paper: '#F4F1EA', sand: '#E8E1D2', white: '#FFFFFF', sea: '#0E3B3A', or: '#FF5B1F', orDk: '#B83A0C', g: '#5C5850', gLt: '#B5B0A6', line: 'rgba(15, 15, 14, 0.14)', lineLt: 'rgba(244, 241, 234, 0.16)' }
const MAIL = 'ville@studioluoto.com', TEL = '+358451035362', TEL_H = '045 103 5362'
const LIVE = 'https://www.studioluoto.com'
const ROUTES = { home: { fi: '/', en: '/en' }, works: { fi: '/tyot', en: '/en/work' }, project: { fi: '/projektit/', en: '/en/projects/' }, privacy: { fi: '/tietosuoja', en: '/en/privacy' }, terms: { fi: '/ehdot', en: '/en/terms' }, '404': { fi: '/404', en: '/404' } }
const route = (key, l, slug) => key === 'project' ? ROUTES.project[l] + slug : ROUTES[key][l]
const SLUGS = SITE.fi.works.map(w => w.slug)

let L = 'fi'
const t = (fi, en) => L === 'fi' ? fi : en

// ---------- jobs ----------
const ALL = ['en', 'works-fi', 'works-en', 'project-fi-all', 'project-en-all', 'privacy-fi', 'privacy-en', 'terms-fi', 'terms-en', '404']
let jobs = process.argv.slice(2)
if (!jobs.length) { console.log('usage: node build-site.mjs all | en | works-fi | project-fi-kallistus | ...'); process.exit(1) }
if (jobs.includes('all')) jobs = ALL
jobs = jobs.flatMap(j => /^project-(fi|en)-all$/.test(j) ? SLUGS.map(s => j.replace('all', s)) : [j])

const f = await connect(PROJECT, KEY)
const log = (...a) => console.log(...a)

try {
  // ---------- fonts and text styles: reuse the front page's styles by name, so one change in Framer reaches every page ----------
  const font = {
    serif: await f.getFont('Newsreader', { weight: 500 }),
    sans4: await f.getFont('Archivo', { weight: 400 }), sans5: await f.getFont('Archivo', { weight: 500 }),
    sans6: await f.getFont('Archivo', { weight: 600 }), sans7: await f.getFont('Archivo', { weight: 700 }),
  }
  const existing = new Map()
  for (const s of await f.getTextStyles()) if (!existing.has(s.name)) existing.set(s.name, s)
  const styleCache = new Map()
  async function st(name, o) {
    if (styleCache.has(name)) return styleCache.get(name)
    let s = existing.get(name)
    if (!s) {
      const [d, tb, p] = o.size
      s = await f.createTextStyle({
        path: '/Luoto/' + name, tag: o.tag || 'p', font: font[o.font], fontSize: d + 'px', lineHeight: o.lh || '1.55em', letterSpacing: o.ls || '0em',
        color: o.color || C.ink, alignment: o.align || 'left', transform: o.upper ? 'uppercase' : 'none', decoration: o.under ? 'underline' : 'none', balance: !!o.balance,
        minWidth: 1200, breakpoints: [{ minWidth: 1200, fontSize: tb + 'px' }, { minWidth: 810, fontSize: p + 'px' }], // Framer: minWidth is the top of the range
      })
      existing.set(name, s)
    }
    styleCache.set(name, s); return s
  }
  const TS = {
    d1: (color, align) => st(`D1 ${align || 'left'} ${color}`, { tag: 'h1', font: 'serif', size: [104, 72, 40], lh: '0.98em', ls: '-0.03em', color, align, balance: true }),
    d2: (color, align) => st(`D2 ${align || 'left'} ${color}`, { tag: 'h2', font: 'serif', size: [66, 48, 36], lh: '1.02em', ls: '-0.025em', color, align, balance: true }),
    d3: (color, align) => st(`D3 ${align || 'left'} ${color}`, { tag: 'h3', font: 'serif', size: [38, 30, 26], lh: '1.1em', ls: '-0.02em', color, align, balance: true }),
    lab: (color, align) => st(`Label ${align || 'left'} ${color}`, { font: 'sans6', size: [13, 13, 13], lh: '1.4em', ls: '0.1em', color, align, upper: true }),
    body: (size, color, align, fw) => st(`Body ${size.join('-')} ${fw || 4} ${align || 'left'} ${color}`, { font: 'sans' + (fw || 4), size, lh: '1.55em', color, align }),
    h4: (color) => st(`Card title ${color}`, { tag: 'h3', font: 'sans6', size: [20, 20, 19], lh: '1.25em', ls: '-0.01em', color }),
    serif: (size, color, align, lh) => st(`Serif ${size.join('-')} ${align || 'left'} ${color}`, { tag: 'h3', font: 'serif', size, lh: lh || '1.2em', ls: '-0.01em', color, align }),
    link: (color, size) => st(`Link ${color} ${size || 16}`, { font: 'sans5', size: [size || 16, size || 16, size || 16], lh: '1.3em', color, under: true }),
  }

  // ---------- assets (each file is uploaded once per run) ----------
  const svg = n => fs.readFileSync(HERE + 'svg/' + n)
  const up = async (name, bytes, mime) => f.uploadImage({ image: { bytes: new Uint8Array(bytes), mimeType: mime }, name })
  const upCache = new Map()
  const upUrl = async p => { if (!upCache.has(p)) upCache.set(p, await f.uploadImage({ image: AMAP[p] || (LIVE + p), name: p.split('/').slice(-3).join('-') })); return upCache.get(p) }
  // an image with its alt text in the page's language
  async function pic(p, alt) { const a = await upUrl(p); try { return a.cloneWithAttributes({ altText: alt }) } catch (e) { return a } }
  const IMG = {
    kartta: await upUrl('/assets/luoto/kartta.svg'),
    logo: await upUrl('/assets/luoto/luoto-vaaka-musta.svg'), logoW: await upUrl('/assets/luoto/luoto-vaaka-valkoinen.svg'),
    merkkiW: await upUrl('/assets/luoto/luoto-merkki-valkoinen.svg'),
    shore5: await up('shore-5.svg', svg('shore-5.svg'), 'image/svg+xml'), shore11: await up('shore-11.svg', svg('shore-11.svg'), 'image/svg+xml'),
    tick: await up('tick.svg', svg('tick.svg'), 'image/svg+xml'), cross: await up('cross.svg', svg('cross.svg'), 'image/svg+xml'),
    arrowP: await up('arrow-paper.svg', svg('arrow-paper.svg'), 'image/svg+xml'), arrowI: await up('arrow-ink.svg', svg('arrow-ink.svg'), 'image/svg+xml'),
    valtteri: await up('valtteri.webp', fs.readFileSync(HERE + 'img/valtteri-gray.webp'), 'image/webp'),
    ville: await up('ville.webp', fs.readFileSync(HERE + 'img/ville-480.webp'), 'image/webp'),
  }
  for (const k of ['msg', 'clock', 'pins', 'key', 'tile', 'pipe', 'house']) IMG['ill-' + k] = await up(`ill-${k}.svg`, svg(`ill-${k}.svg`), 'image/svg+xml')
  log('assets ok')

  // ---------- code components: a file is rewritten only when its code really changed ----------
  const fonts = K.fontsCSS(AMAP)
  const codeFiles = await f.getCodeFiles()
  async function code(name, src) {
    const ex = codeFiles.find(c => c.name === name + '.tsx' || c.name === name)
    const file = ex ? (ex.content === src ? ex : await ex.setFileContent(src)) : await f.createCodeFile(name + '.tsx', src)
    return file.exports.find(e => e.type === 'component').insertURL
  }
  const CODE = {
    marq: await code('Liukurivi', K.liukurivi(fonts, AMAP['/assets/luoto/luoto-merkki-musta.svg'])),
    video: await code('Prosessivideo', K.video()),
    ukk: await code('Kysymykset', K.ukk(fonts)),
    demo: await code('DemoNappi', K.demonappi(fonts, MAIL, TEL, TEL_H)),
  }
  log('code ok')
  const DEMO_EN = {
    otsikko: 'Request a free demo', johdanto: 'You will see your new front page in 48 hours. Free, with no commitment. We reply within one working day.',
    nimi: 'Name', yritys: 'Company', sahkoposti: 'Email', puhelin: 'Phone', sivut: 'Current website', sivutEsim: 'www.yourcompany.fi', viesti: 'What do you do, and where?',
    laheta: 'Send demo request', lahetetaan: 'Sending…', kiitos: 'Thank you! Your demo request has been sent. We will reply within one working day.',
    virhe: `Sending failed. Please email ${MAIL} or call ${TEL_H}.`, tietosuojaTeksti: 'We only use your details to reply to you.', tietosuoja: 'Privacy', tietosuojaLinkki: '/en/privacy', taiSoita: 'Or call', sulje: 'Close',
  }

  // ---------- per-page state ----------
  let OV = [], GRIDS = new Set()
  const ov = (id, tablet, phone) => OV.push([id, tablet || null, phone || null])
  const CELL = { gridItemFillCellWidth: true, gridItemFillCellHeight: true, gridItemVerticalAlignment: 'start', gridItemHorizontalAlignment: 'start' }

  // ---------- layer helpers (links are set after the layer exists: Framer drops a link given at creation) ----------
  async function F(parent, a = {}) {
    const { link, ...rest } = a
    const n = await f.createFrameNode({ position: 'relative', width: '100%', height: 'fit-content', layout: 'stack', stackDirection: 'vertical', stackAlignment: 'start', stackDistribution: 'start', gap: '0px', backgroundColor: null, ...(GRIDS.has(parent) ? CELL : {}), ...rest }, parent)
    if (link) await f.setAttributes(n.id, { link, linkOpenInNewTab: link.startsWith('http') })
    return n
  }
  const row = (parent, a = {}) => F(parent, { stackDirection: 'horizontal', stackAlignment: 'center', ...a })
  // a linked text sits in a linked frame: a link on the text itself would turn it Framer's default blue
  async function T(parent, text, style, a = {}) {
    const { link, ...rest } = a
    let host = parent
    if (link) {
      const w = await F(parent, { name: 'Linkki', width: rest.width || '100%', ...(rest.maxWidth ? { maxWidth: rest.maxWidth } : {}), link })
      host = w.id; rest.width = rest.width === 'fit-content' ? 'fit-content' : '100%'; delete rest.maxWidth
    }
    const n = await f.createTextNode({ position: 'relative', width: '100%', height: 'fit-content', ...rest }, host)
    await n.setText(text); await f.setAttributes(n.id, { inlineTextStyle: await style })
    return n
  }
  const gap = (parent, px, name) => F(parent, { name: name || 'Väli', height: px + 'px', width: '100%' })
  const pad4 = (a, b, c, d) => `${a}px ${b}px ${c === undefined ? a : c}px ${d === undefined ? b : d}px`
  let P = null
  async function band(name, a = {}) {
    const outer = await F(P, { name, stackAlignment: 'center', ...a })
    const inner = await F(outer.id, { name: name + ' · sisältö', maxWidth: '1416px', padding: pad4(0, 48) })
    ov(inner.id, { padding: pad4(0, 32) }, { padding: pad4(0, 16) })
    return { outer, inner }
  }
  const SEC = [160, 104, 96]
  async function section(name, a = {}, sizes = SEC) {
    const b = await band(name, { padding: pad4(sizes[0], 0, 0, 0), ...a })
    ov(b.outer.id, { padding: pad4(sizes[1], 0, 0, 0) }, { padding: pad4(sizes[2], 0, 0, 0) })
    return b
  }
  async function hard(parent, { dx = 0, dy = 6, color = C.ink, radius = 22, width = '100%', rotation = 0, name = 'Kortti' }, inner = {}) {
    // in a grid the wrapper is itself a one-cell grid, so the card stretches to the row without losing its own height
    const inGrid = GRIDS.has(parent)
    const cell = inGrid ? { layout: 'grid', gridColumnCount: 1, gridRowCount: 1, gridColumnWidthType: 'minmax', gridColumnMinWidth: 1, gridRowHeightType: 'auto', gridAlignment: 'start', gap: '0px' } : {}
    const w = await F(parent, { name: name + ' · varjolla', width, rotation, padding: pad4(0, Math.max(dx, 0), Math.max(dy, 0), 0), ...cell })
    await F(w.id, { name: 'Varjo', position: 'absolute', top: dy + 'px', left: dx + 'px', right: '0px', bottom: '0px', width: null, height: null, backgroundColor: color, borderRadius: radius + 'px', layout: null })
    if (inGrid) GRIDS.add(w.id)
    return F(w.id, { name, borderRadius: radius + 'px', ...inner })
  }
  const icon = (parent, img, size, a = {}) => F(parent, { name: 'Kuvake', width: size + 'px', height: size + 'px', backgroundImage: img, layout: null, ...a })
  async function dotIcon(parent, img, bg, size = 26, inner = 14) {
    const c = await F(parent, { name: 'Merkki', width: size + 'px', height: size + 'px', borderRadius: '50%', backgroundColor: bg, stackAlignment: 'center', stackDistribution: 'center' })
    await icon(c.id, img, inner)
    return c
  }
  async function pill(parent, text, bg, color, a = {}) {
    const p = await row(parent, { name: 'Pilleri', width: 'fit-content', height: '30px', padding: pad4(0, 12), borderRadius: '999px', backgroundColor: bg, ...a })
    await T(p.id, text, st(`Pill ${color}`, { font: 'sans6', size: [13, 13, 13], lh: '1em', ls: '0.04em', color }), { width: 'fit-content' })
    return p
  }
  async function button(parent, label, link, variant = 'ink') {
    const shadow = variant === 'or' ? C.orDk : C.or
    const card = await hard(parent, { dy: 5, color: shadow, radius: 999, width: 'fit-content', name: 'Nappi' },
      { stackDirection: 'horizontal', stackAlignment: 'center', gap: '12px', height: '60px', padding: pad4(0, 30), backgroundColor: variant === 'or' ? C.or : C.ink, width: 'fit-content', link })
    await T(card.id, label, st(`Button ${variant}`, { font: 'sans6', size: [16, 16, 16], lh: '1em', ls: '0.01em', color: variant === 'or' ? C.ink : C.paper }), { width: 'fit-content' })
    await icon(card.id, variant === 'or' ? IMG.arrowI : IMG.arrowP, 18)
    return card
  }
  async function head(parent, kind, plain, em, color, emColor, align, a = {}) {
    const box = await F(parent, { name: 'Otsikko', stackAlignment: align === 'center' ? 'center' : 'start', ...a })
    if (plain) await T(box.id, plain, TS[kind](color, align))
    if (em) await T(box.id, em, TS[kind](emColor, align))
    return box
  }
  async function grid(parent, cols, gaps, n, a = {}) {
    const rows = c => Math.ceil(n / c)
    const g = await F(parent, { name: 'Ruudukko', layout: 'grid', gridColumnCount: cols[0], gridRowCount: rows(cols[0]), gridColumnWidthType: 'minmax', gridColumnMinWidth: 1, gridRowHeightType: 'fit', gridAlignment: 'start', gap: gaps, ...a })
    ov(g.id, { gridColumnCount: cols[1], gridRowCount: rows(cols[1]) }, { gridColumnCount: cols[2], gridRowCount: rows(cols[2]) })
    GRIDS.add(g.id)
    return g
  }
  async function split(parent, widths, a = {}, stackAt = ['tablet', 'phone']) {
    const s = await row(parent, { name: 'Sarakkeet', stackAlignment: a.stackAlignment || 'end', gap: a.gap || '64px', ...a })
    const vert = { stackDirection: 'vertical', stackAlignment: 'start', gap: a.vgap || '20px' }
    ov(s.id, stackAt.includes('tablet') ? vert : null, stackAt.includes('phone') ? vert : null)
    const cols = []
    for (const w of widths) {
      const c = await F(s.id, { name: 'Sarake', width: w })
      ov(c.id, stackAt.includes('tablet') ? { width: '100%' } : null, stackAt.includes('phone') ? { width: '100%' } : null)
      cols.push(c)
    }
    return cols
  }
  const demo = (parent, teksti, tyyli, extra = {}) => f.addComponentInstance({ url: CODE.demo, parentId: parent }).then(async n => {
    await f.setAttributes(n.id, { position: 'relative', top: null, left: null, width: 'fit-content', height: 'fit-content', name: 'Demopyyntö-nappi', controls: { teksti, tyyli, ...(L === 'en' ? DEMO_EN : {}), ...extra } })
    return n
  })
  async function comp(parent, url, controls, attrs = {}) {
    const n = await f.addComponentInstance({ url, parentId: parent })
    await f.setAttributes(n.id, { position: 'relative', top: null, left: null, width: '100%', height: 'fit-content', ...attrs, controls })
    return n
  }

  // ---------- links to the front page's sections ----------
  const pageLink = (pageId, nodeId) => `data:framer/page-link,${pageId}?element=${nodeId}`
  const HOME = {}
  async function homeOf(l) {
    if (HOME[l]) return HOME[l]
    const page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === ROUTES.home[l])
    if (!page) return null
    const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
    const kids = await f.getChildren(desk.id)
    const sec = {}
    for (const k of ['Alku', 'Palvelu', 'Prosessi', 'Hinnat', 'Kysymykset', 'Yhteys']) { const n = kids.find(c => c.name === k); if (n) sec[k] = pageLink(page.id, n.id) }
    return (HOME[l] = sec)
  }
  const NAV = () => [[t('Palvelu', 'Service'), 'Palvelu'], [t('Näin se toimii', 'How it works'), 'Prosessi'], [t('Hinnat', 'Pricing'), 'Hinnat'], [t('Työt', 'Work'), 'works'], [t('Kysymykset', 'Questions'), 'Kysymykset']]
  const navTarget = async (k) => k === 'works' ? route('works', L) : ((await homeOf(L)) || {})[k] || route('home', L)

  // ---------- a clean page ----------
  async function freshPage(path) {
    let page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === path)
    if (page && path !== '/') { try { await f.removeNode(page.id); page = null } catch (e) { log('keep page', path, e.message.slice(0, 60)) } }
    if (!page) page = await f.createWebPage(path)
    for (let round = 0; round < 5; round++) {
      const bpsNow = await f.getChildren(page.id)
      const d = bpsNow.find(b => b.name === 'Desktop') || bpsNow[0]
      const extra = bpsNow.filter(b => b.id !== d.id)
      const kids = await f.getChildren(d.id)
      if (!extra.length && !kids.length) break
      if (extra.length) await f.removeNodes(extra.map(b => b.id))
      if (kids.length) await f.removeNodes(kids.map(c => c.id))
      await new Promise(r => setTimeout(r, 1500))
    }
    const bps = await f.getChildren(page.id)
    if (bps.length !== 1 || (await f.getChildren(bps[0].id)).length) throw new Error('page did not empty: ' + path)
    const desk = bps[0]
    await f.setAttributes(desk.id, { name: 'Desktop', layout: 'stack', stackDirection: 'vertical', stackAlignment: 'center', gap: '0px', padding: '0px', height: 'fit-content', backgroundColor: C.paper, overflow: 'hidden' })
    OV = []; GRIDS = new Set(); P = desk.id
    return { page, desk }
  }
  async function finishPage(page, hdr) {
    await f.setParent(hdr.id, P)   // the header comes last so it sits on top
    const tab = await page.addBreakpoint(P, { name: 'Tablet', width: 810 })
    const pho = await page.addBreakpoint(P, { name: 'Phone', width: 390 })
    let miss = 0
    for (const [id, tb, p] of OV) for (const [bp, a] of [[tab, tb], [pho, p]]) {
      if (!a) continue
      try { await f.setAttributes(bp.id + id, a) } catch (e) { miss++; if (miss < 4) log('override miss', bp.name, e.message.slice(0, 80)) }
    }
    return miss
  }

  // ---------- shared parts ----------
  // other: the same page in the other language
  async function header(other, ctaTarget) {
    const hdr = await F(P, { name: 'Ylätunniste', padding: pad4(0, 12), zIndex: 100, stackAlignment: 'center' })
    await f.setAttributes(hdr.id, { position: 'fixed', top: '14px', left: '0px', right: '0px', width: null })
    const pillNav = await row(hdr.id, { name: 'Valikko', maxWidth: '1180px', height: '64px', gap: '20px', padding: pad4(0, 10, 0, 24), borderRadius: '999px', backgroundColor: 'rgba(244, 241, 234, 0.94)', border: { width: '1px', color: C.line, style: 'solid' } })
    const logoBox = await row(pillNav.id, { name: 'Logo', width: '1fr', link: route('home', L) })
    await F(logoBox.id, { name: 'Studio Luoto', width: '140px', height: '21px', backgroundImage: IMG.logo, layout: null })
    const navLinks = await row(pillNav.id, { name: 'Linkit', width: 'fit-content', gap: '30px' })
    ov(navLinks.id, { visible: false }, { visible: false })
    for (const [label, k] of NAV()) {
      const box = await row(navLinks.id, { name: label, width: 'fit-content', height: '44px', link: await navTarget(k) })
      await T(box.id, label, st('Nav', { font: 'sans5', size: [15, 15, 15], lh: '1.2em' }), { width: 'fit-content' })
    }
    const lang = await row(pillNav.id, { name: 'Kieli', width: '44px', height: '44px', borderRadius: '999px', border: { width: '1px', color: C.line, style: 'solid' }, stackDistribution: 'center', link: other })
    await T(lang.id, L === 'fi' ? 'EN' : 'FI', st('Lang', { font: 'sans6', size: [14, 14, 14], lh: '1em', ls: '0.04em', align: 'center' }), { width: 'fit-content' })
    const cta = await row(pillNav.id, { name: 'Pyydä demo', width: 'fit-content', height: '44px', padding: pad4(0, 20), borderRadius: '999px', backgroundColor: C.ink, link: ctaTarget || undefined })
    await T(cta.id, t('Pyydä demo', 'Request a demo'), st('Nav CTA', { font: 'sans6', size: [15, 15, 14], lh: '1em', color: C.paper }), { width: 'fit-content' })
    return { hdr, cta }
  }
  async function contact() {
    const { outer, inner } = await section('Yhteys')
    const card = await F(inner.id, { name: t('Pyydä demo', 'Request a demo'), backgroundColor: C.or, borderRadius: '32px', padding: pad4(120, 80), stackAlignment: 'center' })
    ov(card.id, { padding: pad4(72, 40) }, { padding: pad4(48, 22) })
    await T(card.id, t('Pyydä ilmainen demo.', 'Request a free demo.'), TS.d1(C.ink, 'center'))
    await gap(card.id, 24)
    await T(card.id, t('Lähetä linkki nykyisiin sivuihisi ja kerro, mitä teette ja missä. Näet uuden etusivusi 48 tunnissa. Maksuton, eikä sido mihinkään.', 'Send a link to your current site and tell us what you do and where. You will see your new front page in 48 hours. Free, with no commitment.'), TS.body([21, 19, 18], C.ink, 'center'), { maxWidth: '560px' })
    await gap(card.id, 36)
    const d = await row(card.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true, stackDistribution: 'center' })
    await demo(d.id, t('Lähetä demopyyntö', 'Send a demo request'), 'musta', { tummaVarjo: true })
    await T(d.id, t('tai soita ', 'or call ') + TEL_H, TS.link(C.ink), { width: 'fit-content', link: 'tel:' + TEL })
    return outer
  }
  async function footer(page, topId, other) {
    await gap(P, 200, 'Väli ennen rantaa')
    const sh = await F(P, { name: 'Ranta', height: '66px', backgroundImage: IMG.shore11, layout: null })
    ov(sh.id, { height: '50px' }, { height: '34px' })
    const { inner } = await band('Alatunniste', { backgroundColor: C.ink, padding: pad4(110, 0, 28, 0) })
    const top = await row(inner.id, { name: 'Ylärivi', stackDistribution: 'space-between', stackAlignment: 'end', gap: '32px', stackWrapEnabled: true })
    ov(top.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
    const say = await T(top.id, t('Verkkosivut palveluna remontti- ja LVI-yrityksille. Me rakennamme, ylläpidämme ja kehitämme. Sinä keskityt töihin.', 'Websites as a service for renovation and HVAC firms. We build, maintain and improve. You focus on the work.'), st('Footer say', { tag: 'p', font: 'serif', size: [46, 38, 28], lh: '1.1em', ls: '-0.02em', color: C.paper }), { width: '1fr', maxWidth: '780px' })
    ov(say.id, null, { width: '100%' })
    await demo(top.id, t('Pyydä ilmainen demo', 'Request a free demo'), 'oranssi')
    await gap(inner.id, 72)
    const g = await grid(inner.id, [3, 3, 1], '28px', 3, { padding: pad4(32, 0, 0, 0), border: { width: '1px 0px 0px 0px', color: C.lineLt, style: 'solid' } })
    const col = async (title, items) => {
      const c = await F(g.id, { name: title, gap: '6px' })
      await T(c.id, title, TS.lab(C.gLt))
      await gap(c.id, 4)
      for (const [x, link] of items) await T(c.id, x, TS.body([15, 15, 15], C.paper), { width: 'fit-content', ...(link ? { link } : {}) })
    }
    await col(t('Yhteys', 'Contact'), [[MAIL, 'mailto:' + MAIL], [TEL_H, 'tel:' + TEL]])
    const nav = []; for (const [label, k] of NAV()) nav.push([label, await navTarget(k)])
    await col(t('Sivut', 'Pages'), nav)
    const o = L === 'fi' ? 'en' : 'fi'
    await col('Studio', [['Isosaarentie 10, 00840 Helsinki', null], [t('Tietosuoja', 'Privacy'), route('privacy', L)], [t('Sopimusehdot', 'Terms'), route('terms', L)], [t('In English', 'Suomeksi'), other || route('home', o)]])
    await gap(inner.id, 110)
    await F(inner.id, { name: 'Studio Luoto', backgroundImage: IMG.logoW, aspectRatio: 968 / 145, height: null, layout: null })
    await gap(inner.id, 24)
    const bot = await row(inner.id, { name: 'Alarivi', stackDistribution: 'space-between', gap: '8px 24px', stackWrapEnabled: true })
    await T(bot.id, `© 2026 Studio Luoto · Ville Saarela, ${t('Y-tunnus', 'Business ID')} 3660060-6`, TS.body([13, 13, 13], C.gLt), { width: 'fit-content' })
    await T(bot.id, t('Ylös ↑', 'Back to top ↑'), TS.body([13, 13, 13], C.gLt), { width: 'fit-content', link: pageLink(page.id, topId) })
  }
  // the light top of an inner page
  async function pageTop(lab, plain, em, lead, labLink) {
    const { outer, inner } = await band('Alku', { padding: pad4(200, 0, 0, 0) })
    ov(outer.id, { padding: pad4(170, 0, 0, 0) }, { padding: pad4(140, 0, 0, 0) })
    if (lab) await T(inner.id, lab, TS.lab(C.ink), labLink ? { width: 'fit-content', link: labLink } : {})
    await gap(inner.id, 16)
    await head(inner.id, 'd1', plain, em, C.ink, C.sea, 'left', { maxWidth: '1100px' })
    if (lead) { await gap(inner.id, 28); await T(inner.id, lead, TS.body([21, 19, 18], C.g), { maxWidth: '720px' }) }
    return { outer, inner }
  }

  // =================== PAGES ===================
  async function worksPage() {
    const path = route('works', L), other = route('works', L === 'fi' ? 'en' : 'fi')
    const { page } = await freshPage(path)
    const top = await pageTop(t('Työt', 'Work'), t('Viimeisimmät', 'Latest'), t('työt.', 'work.'),
      t('Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio ja vaatemerkki. Jokaisen sivulla kerromme, mistä lähdettiin ja mitä sivusto tekee yritykselle.',
        'Eight sites: a bathroom renovation company, an HVAC company, a kitchen joinery, two architecture firms, an interior architect, a design studio and a clothing brand. On each page we explain where we started and what the site does for the business.'))
    const { inner } = await section('Työt', {}, [72, 56, 48])
    const ws = SITE[L].works
    const g = await grid(inner.id, [2, 2, 1], '56px 32px', ws.length)
    ov(g.id, { gap: '40px 24px' }, { gap: '40px' })
    for (const w of ws) {
      const tile = await F(g.id, { name: w.name, gap: '18px', link: route('project', L, w.slug) })
      await F(tile.id, { name: 'Kansikuva', backgroundImage: await pic(`/assets/img/projektit/${w.slug}/cover.webp`, `${w.name}: ${t('sivuston etusivu', 'the site’s front page')}`), aspectRatio: 1.6, height: null, layout: null, borderRadius: '20px', border: { width: '2px', color: C.ink, style: 'solid' }, overflow: 'hidden' })
      const r = await row(tile.id, { name: 'Tiedot', stackAlignment: 'start', stackDistribution: 'space-between', gap: '16px' })
      const tx = await F(r.id, { name: 'Nimi', width: '1fr', gap: '4px' })
      await T(tx.id, w.name, TS.h4(C.ink))
      await T(tx.id, w.title, TS.body([16, 16, 15], C.g))
      const tag = await row(r.id, { name: 'Ala', width: 'fit-content', padding: pad4(6, 12), borderRadius: '999px', border: { width: '1px', color: C.ink, style: 'solid' } })
      await T(tag.id, w.ala, TS.body([13, 13, 13], C.ink), { width: 'fit-content' })
      ov(tag.id, null, { visible: false })
    }
    const yh = await contact()
    const { hdr } = await header(other, pageLink(page.id, yh.id))
    await footer(page, top.outer.id, other)
    return finishPage(page, hdr)
  }

  async function projectPage(slug) {
    const ws = SITE[L].works, i = ws.findIndex(w => w.slug === slug), w = ws[i], nxt = ws[(i + 1) % ws.length]
    const path = route('project', L, slug), other = route('project', L === 'fi' ? 'en' : 'fi', slug)
    const { page } = await freshPage(path)
    const b = `/assets/img/projektit/${slug}`, sh = w.short, a = w.alt
    // top
    const { outer, inner } = await band('Alku', { padding: pad4(200, 0, 0, 0) })
    ov(outer.id, { padding: pad4(170, 0, 0, 0) }, { padding: pad4(140, 0, 0, 0) })
    const crumb = await row(inner.id, { name: 'Polku', width: 'fit-content', gap: '6px' })
    await T(crumb.id, t('Työt', 'Work'), TS.lab(C.ink), { width: 'fit-content', link: route('works', L) })
    await T(crumb.id, `/ ${String(i + 1).padStart(2, '0')}`, TS.lab(C.g), { width: 'fit-content' })
    await gap(inner.id, 16)
    await T(inner.id, w.name, TS.d1(C.ink))
    await gap(inner.id, 14)
    await T(inner.id, w.title + '.', TS.d3(C.g), { maxWidth: '900px' })
    await gap(inner.id, 44)
    const facts = await grid(inner.id, [4, 2, 2], '24px', 4)
    for (const [k, v] of [[t('Ala', 'Field'), w.ala], [t('Paikkakunta', 'Location'), w.city], [t('Työ', 'Work'), w.work], [t('Sivusto', 'Site'), w.site]]) {
      const c = await F(facts.id, { name: k, gap: '8px', padding: pad4(14, 0, 0, 0), border: { width: '1px 0px 0px 0px', color: C.line, style: 'solid' } })
      await T(c.id, k, TS.lab(C.g))
      await T(c.id, v, TS.body([17, 17, 16], C.ink, 'left', 5))
    }
    await gap(inner.id, 32)
    const cn = await row(inner.id, { name: t('Konsepti', 'Concept'), gap: '12px 14px', stackAlignment: 'start', stackWrapEnabled: true })
    ov(cn.id, null, { stackDirection: 'vertical' })
    await pill(cn.id, t('Konsepti', 'Concept'), C.or, C.ink)
    const ct = await T(cn.id, w.concept, TS.body([16, 16, 15], C.g), { width: '1fr', maxWidth: '760px' }); ov(ct.id, null, { width: '100%' })
    // pictures and text
    const fig = async (parent, p, alt, ratio = 1.6, name = 'Kuva') => F(parent, { name, backgroundImage: await pic(p, alt), aspectRatio: ratio, height: null, layout: null, borderRadius: '20px', border: { width: '2px', color: C.ink, style: 'solid' }, overflow: 'hidden' })
    const picBand = async (name, gapTop = 56) => { const x = await section(name, {}, [gapTop, gapTop, 40]); return x.inner }
    await fig(await picBand(t('Etusivu', 'Front page')), `${b}/cs/koti.webp`, `${sh}: ${t('etusivu', 'front page')}`)
    const sec = async (title, fill) => {
      const { inner: si } = await section(title, {}, [104, 80, 64])
      const [l, r] = await split(si.id, ['0.8fr', '1.2fr'], { stackAlignment: 'start', gap: '64px', vgap: '20px' })
      await T(l.id, title, TS.d3(C.ink))
      await fill(r)
    }
    const paras = async (r, ps) => { for (const [k, p] of ps.entries()) { if (k) await gap(r.id, 16); await T(r.id, p, TS.body([19, 18, 17], C.ink)) } }
    await sec(t('Lähtökohta', 'Starting point'), r => paras(r, w.start))
    const g2 = await grid(await picBand(t('Kuvat', 'Pictures'), 72), [2, 2, 1], '24px', 2)
    await fig(g2.id, `${b}/cs/lista.webp`, `${sh}: ${a.lista}`)
    await fig(g2.id, `${b}/cs/kohde.webp`, `${sh}: ${a.kohde}`)
    await sec(t('Ratkaisu', 'Solution'), r => paras(r, [w.solution]))
    await fig(await picBand(t('Kohdesivu', 'Project page'), 72), `${b}/cs/kohde-2.webp`, `${sh}: ${a.kohde}, ${t('tiedot', 'details')}`)
    await sec(t('Mitä sivusto tekee', 'What the site does'), async r => {
      for (const [k, [x, d]] of w.does.entries()) {
        const it = await F(r.id, { name: x, gap: '8px', padding: pad4(18, 0), border: { width: k ? '1px 0px 0px 0px' : '2px 0px 0px 0px', color: k ? C.line : C.ink, style: 'solid' } })
        await T(it.id, String(k + 1).padStart(2, '0'), TS.lab(C.orDk))
        await T(it.id, x, TS.h4(C.ink))
        await T(it.id, d, TS.body([17, 17, 16], C.g))
      }
    })
    await sec(t('Toteutus', 'Build'), async r => {
      for (const m of w.made) {
        const rw = await row(r.id, { name: 'Rivi', gap: '14px', stackAlignment: 'start', padding: pad4(10, 0) })
        await dotIcon(rw.id, IMG.tick, C.or, 26, 14)
        await T(rw.id, m, TS.body([17, 17, 16], C.ink), { width: '1fr' })
      }
      await gap(r.id, 18)
      await T(r.id, w.mobile, TS.body([17, 17, 16], C.g))
    })
    const g3 = await grid(await picBand(t('Puhelimella', 'On a phone'), 72), [3, 3, 3], '32px', 3)
    ov(g3.id, { gap: '20px' }, { gap: '10px' })
    for (const k of [1, 2, 3]) {
      const m = await fig(g3.id, `${b}/mobile-${k}.webp`, t(`${sh} puhelimella, näkymä ${k}`, `${sh} on a phone, view ${k}`), 600 / 1298, t('Puhelin', 'Phone'))
      ov(m.id, null, { borderRadius: '10px' })
    }
    await fig(await picBand(t('Hinnat', 'Pricing'), 32), `${b}/cs/hinnat.webp`, `${sh}: ${a.hinnat}`)
    // credits and the live site
    const { inner: fi } = await section(t('Tekijät', 'Credits'), {}, [56, 48, 40])
    const fr = await row(fi.id, { name: 'Lopuksi', stackDistribution: 'space-between', gap: '20px 32px', stackWrapEnabled: true, padding: pad4(28, 0, 0, 0), border: { width: '1px 0px 0px 0px', color: C.line, style: 'solid' } })
    ov(fr.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
    const cr = await T(fr.id, w.credits + t('', ' The site itself is in Finnish.'), TS.body([14, 14, 14], C.g), { width: '1fr', maxWidth: '640px' }); ov(cr.id, null, { width: '100%' })
    await button(fr.id, t('Avaa sivusto', 'Open the site'), `${LIVE}/demot/${slug}/`, 'ink')
    // next project
    const { inner: ni } = await section(t('Seuraava työ', 'Next project'), {}, [96, 80, 64])
    const nx = await F(ni.id, { name: nxt.name, gap: '10px', padding: pad4(36, 0), border: { width: '2px 0px 2px 0px', color: C.ink, style: 'solid' }, link: route('project', L, nxt.slug) })
    await T(nx.id, t('Seuraava työ', 'Next project'), TS.lab(C.g))
    await T(nx.id, nxt.name + ' →', TS.d2(C.ink))
    const yh = await contact()
    const { hdr } = await header(other, pageLink(page.id, yh.id))
    await footer(page, outer.id, other)
    return finishPage(page, hdr)
  }

  async function docPage(kind) {
    const path = route(kind, L), other = route(kind, L === 'fi' ? 'en' : 'fi')
    const { page } = await freshPage(path)
    const isTerms = kind === 'terms'
    const { outer, inner } = await band('Alku', { padding: pad4(200, 0, 0, 0) })
    ov(outer.id, { padding: pad4(170, 0, 0, 0) }, { padding: pad4(140, 0, 0, 0) })
    const doc = await F(inner.id, { name: t('Teksti', 'Text'), maxWidth: '760px' })
    await T(doc.id, isTerms ? t('Voimassa 15.10.2026 alkaen', 'In force from 15 October 2026') : t('Päivitetty 15.10.2026', 'Updated 15 October 2026'), TS.lab(C.g))
    await gap(doc.id, 16)
    await T(doc.id, isTerms ? t('Sopimusehdot', 'Terms') : t('Tietosuoja', 'Privacy'), TS.d1(C.ink))
    for (const [h, ps] of (isTerms ? SITE[L].terms : SITE[L].privacy)) {
      await gap(doc.id, 48)
      await T(doc.id, h, TS.d3(C.ink))
      for (const p of ps) { await gap(doc.id, 14); await T(doc.id, p, TS.body([18, 18, 17], C.ink)) }
    }
    if (!isTerms) {
      await gap(doc.id, 48)
      const cr = await row(doc.id, { name: t('Yhteys', 'Contact'), width: 'fit-content', gap: '8px 24px', stackWrapEnabled: true })
      await T(cr.id, MAIL, TS.link(C.ink), { width: 'fit-content', link: 'mailto:' + MAIL })
      await T(cr.id, TEL_H, TS.link(C.ink), { width: 'fit-content', link: 'tel:' + TEL })
    }
    const home = await homeOf(L)
    const { hdr } = await header(other, home && home.Yhteys)
    await footer(page, outer.id, other)
    return finishPage(page, hdr)
  }

  async function notFound() {
    L = 'fi'
    const { page } = await freshPage('/404')
    const top = await pageTop('404', 'Sivua ei', 'löytynyt.', null)
    await gap(top.inner.id, 24)
    await T(top.inner.id, 'Osoite on voinut muuttua.', TS.body([21, 19, 18], C.g))
    await T(top.inner.id, 'Page not found. The address may have changed.', TS.body([21, 19, 18], C.g))
    await gap(top.inner.id, 36)
    const d = await row(top.inner.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true })
    await button(d.id, 'Etusivulle', '/', 'ink')
    await T(d.id, 'Työt', TS.link(C.ink), { width: 'fit-content', link: '/tyot' })
    await T(d.id, 'English home page', TS.link(C.ink), { width: 'fit-content', link: '/en' })
    const home = await homeOf('fi')
    const { hdr } = await header('/en', home && home.Yhteys)
    await footer(page, top.outer.id, '/en')
    return finishPage(page, hdr)
  }

  // ---------- the English front page: the same structure as the Finnish one ----------
  async function homePage() {
    L = 'en'
    const D = DATA.en
    const { page } = await freshPage('/en')
    const ANCHOR = {}
    // hero
    const hero = await F(P, { name: 'Alku', backgroundColor: C.ink, backgroundImage: IMG.kartta, padding: pad4(210, 48, 130, 48), stackAlignment: 'center' })
    ov(hero.id, { padding: pad4(170, 32, 100, 32) }, { padding: pad4(150, 16, 80, 16) })
    const heroIn = await F(hero.id, { name: 'Sisältö', maxWidth: '1120px', stackAlignment: 'center' })
    const hl = await row(heroIn.id, { name: 'Yläteksti', width: 'fit-content', gap: '10px', padding: pad4(8, 16), borderRadius: '999px', border: { width: '1px', color: C.lineLt, style: 'solid' } })
    await F(hl.id, { name: 'Piste', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.or, layout: null })
    await T(hl.id, 'Websites as a service for renovation and HVAC firms', TS.body([14, 14, 14], C.gLt, 'left', 5), { width: 'fit-content' })
    await gap(heroIn.id, 28)
    await head(heroIn.id, 'd1', 'Websites that bring your renovation business', 'more quote requests.', C.paper, C.or, 'center')
    await gap(heroIn.id, 28)
    await T(heroIn.id, 'We make sure your site brings in work. We build, maintain and improve it for a monthly price, so you never have to leave the job.', TS.body([21, 19, 18], C.gLt, 'center'), { maxWidth: '560px' })
    await gap(heroIn.id, 40)
    const heroDo = await row(heroIn.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true, stackDistribution: 'center' })
    await demo(heroDo.id, 'Request a free demo', 'oranssi')
    await T(heroDo.id, 'See the work', TS.link(C.paper), { width: 'fit-content', link: route('works', 'en') })
    await gap(heroIn.id, 64)
    const proof = await grid(heroIn.id, [3, 1, 1], '20px', 3, { name: 'Todisteet', maxWidth: '1150px' })
    for (const [ic, bd, s] of [['48 h', 'Free demo in 48 hours', 'A working front page, not a picture. No commitment.'], ['€', '€199/month, all taken care of', 'No setup fee. Changes and maintenance included.'], [null, '“The site gets people excited even before launch.”', 'Valtteri Viitala, BuffBird Oy']]) {
      const card = await hard(proof.id, { dy: 6, color: C.or, radius: 18, name: 'Todiste' }, { stackDirection: 'horizontal', stackAlignment: 'center', gap: '14px', padding: pad4(14, 22, 14, 14), backgroundColor: C.white })
      if (ic) { const box = await F(card.id, { name: 'Ikoni', width: '52px', height: '52px', borderRadius: '14px', backgroundColor: C.or, stackAlignment: 'center', stackDistribution: 'center' }); await T(box.id, ic, st('Proof icon', { font: 'sans7', size: [15, 15, 15], lh: '1em', align: 'center' }), { width: 'fit-content' }) }
      else await F(card.id, { name: 'Kuva', width: '52px', height: '52px', borderRadius: '50%', backgroundImage: IMG.valtteri, layout: null })
      const tx = await F(card.id, { name: 'Teksti', width: '1fr', gap: '2px' })
      await T(tx.id, bd, st('Proof bold', { font: 'sans6', size: [15, 15, 15], lh: '1.35em' }))
      await T(tx.id, s, TS.body([13, 13, 13], C.g))
    }
    // trades
    const tr = await F(P, { name: 'Alat', padding: pad4(30, 0, 32, 0), stackAlignment: 'center', gap: '18px', border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
    await T(tr.id, 'We build sites for these trades', TS.lab(C.g, 'center'))
    await comp(tr.id, CODE.marq, { rivit: D.TRADES, nopeus: 48 }, { name: 'Liukurivi' })
    // problem
    {
      const { inner } = await section('Ongelma')
      const card = await F(inner.id, { name: 'Kortti', backgroundColor: C.ink, borderRadius: '32px', padding: pad4(110, 80), stackAlignment: 'center' })
      ov(card.id, { padding: pad4(70, 40) }, { padding: pad4(44, 22) })
      await T(card.id, 'The problem', TS.lab(C.gLt, 'center'))
      await gap(card.id, 18)
      await head(card.id, 'd2', 'Most renovation sites look tidy.', 'They do not bring quote requests.', C.paper, C.or, 'center', { maxWidth: '760px' })
      await gap(card.id, 28)
      await T(card.id, 'The site was made once, and nobody has looked at it since. In the evening a client compares three companies on their phone and calls the one whose site has the answers.', TS.body([18, 18, 17], C.gLt, 'center'), { maxWidth: '600px' })
      await gap(card.id, 18)
      await T(card.id, 'Your site decides whether they call you or a competitor.', TS.body([18, 18, 17], C.paper, 'center', 6))
      await gap(card.id, 48)
      const stk = await row(card.id, { name: 'Tarrat', maxWidth: '900px', gap: '18px 14px', stackWrapEnabled: true, stackDistribution: 'center' })
      for (const [i, s] of D.STICKERS.entries()) {
        const n = i + 1, rot = n % 3 === 0 ? -1 : n % 2 === 0 ? 2.5 : -3
        const c = await hard(stk.id, { dy: 4, color: C.orDk, radius: 999, width: 'fit-content', rotation: rot, name: 'Tarra' }, { padding: pad4(12, 22), backgroundColor: C.or, width: 'fit-content' })
        await T(c.id, s, st('Sticker', { font: 'sans7', size: [14, 14, 13], lh: '1.2em', ls: '0.06em', upper: true }), { width: 'fit-content' })
      }
    }
    // service
    {
      await gap(P, 200, 'Väli ennen rantaa')
      const sh = await F(P, { name: 'Ranta', height: '66px', backgroundImage: IMG.shore5, layout: null })
      ov(sh.id, { height: '50px' }, { height: '34px' })
      const { outer, inner } = await band('Palvelu', { backgroundColor: C.ink, padding: pad4(110, 0, 150, 0) })
      ov(outer.id, { padding: pad4(90, 0, 110, 0) }, { padding: pad4(72, 0, 88, 0) })
      ANCHOR.Palvelu = outer.id
      await head(inner.id, 'd2', 'What we do for your site.', 'Every month.', C.paper, C.or, 'left', { maxWidth: '900px' })
      await gap(inner.id, 24)
      await T(inner.id, 'Every page has one job: the right client finds you and asks for a quote.', TS.body([20, 19, 18], C.gLt), { maxWidth: '600px' })
      await gap(inner.id, 64)
      const g = await grid(inner.id, [5, 2, 1], '36px 28px', D.DO.length)
      for (const [i, [k, h, d]] of D.DO.entries()) {
        const c = await F(g.id, { name: k, padding: pad4(20, 0, 0, 0), gap: '12px', border: { width: '2px 0px 0px 0px', color: C.or, style: 'solid' } })
        await T(c.id, `${String(i + 1).padStart(2, '0')} / ${k}`, TS.lab(C.or))
        await T(c.id, h, TS.h4(C.paper))
        await T(c.id, d, TS.body([16, 16, 16], C.gLt))
      }
      await gap(inner.id, 48)
      ANCHOR.palveluLink = await F(inner.id, { name: 'Linkki', width: 'fit-content' })
      await T(ANCHOR.palveluLink.id, 'Ask for a demo and see it on your own site →', TS.link(C.paper), { width: 'fit-content' })
    }
    // partner
    {
      const { inner } = await section('Kumppani')
      const [l, r] = await split(inner.id, ['1.1fr', '0.9fr'])
      await T(l.id, 'Website as a service', TS.lab(C.ink))
      await gap(l.id, 14)
      await head(l.id, 'd2', 'An agency launches the site and moves on.', 'We stay.', C.ink, C.sea)
      await T(r.id, 'A site is not finished on launch day. So we do not bill a project: we keep the site in shape and improve it for a monthly price.', TS.body([20, 19, 18], C.g))
      await gap(inner.id, 48)
      const g = await grid(inner.id, [2, 1, 1], '28px', 2)
      const [old, nu] = D.VS
      const a = await F(g.id, { name: 'Tavallinen toimisto', padding: pad4(44, 44), borderRadius: '28px', border: { width: '2px', color: C.line, style: 'solid' } })
      ov(a.id, null, { padding: pad4(24, 24) })
      await T(a.id, 'A typical agency', TS.lab(C.g))
      await gap(a.id, 10)
      for (const [i, x] of old.entries()) {
        const rw = await row(a.id, { name: 'Rivi', gap: '14px', stackAlignment: 'start', padding: pad4(14, 0), border: i ? { width: '1px 0px 0px 0px', color: C.line, style: 'solid' } : null })
        await dotIcon(rw.id, IMG.cross, C.sand, 26, 12)
        await T(rw.id, x, TS.body([17, 17, 16], C.g), { width: '1fr' })
      }
      const b = await hard(g.id, { dx: 10, dy: 10, color: C.or, radius: 28, name: 'Studio Luoto' }, { padding: pad4(44, 44), backgroundColor: C.ink })
      ov(b.id, null, { padding: pad4(24, 24) })
      const bh = await row(b.id, { name: 'Otsikko', gap: '10px', width: 'fit-content' })
      await F(bh.id, { name: 'Merkki', width: '26px', height: '16px', backgroundImage: IMG.merkkiW, layout: null })
      await T(bh.id, 'Studio Luoto', TS.lab(C.paper), { width: 'fit-content' })
      await gap(b.id, 10)
      for (const [i, x] of nu.entries()) {
        const rw = await row(b.id, { name: 'Rivi', gap: '14px', stackAlignment: 'start', padding: pad4(14, 0), border: i ? { width: '1px 0px 0px 0px', color: C.lineLt, style: 'solid' } : null })
        await dotIcon(rw.id, IMG.tick, C.or, 26, 14)
        await T(rw.id, x, TS.body([17, 17, 16], C.paper), { width: '1fr' })
      }
      await gap(inner.id, 96)
      await T(inner.id, 'What a growth partner means in practice.', TS.d3(C.ink), { maxWidth: '620px' })
      await gap(inner.id, 32)
      const pg = await grid(inner.id, [3, 2, 1], '32px 40px', D.PERKS.length)
      for (const [i, [h, d]] of D.PERKS.entries()) {
        const c = await F(pg.id, { name: h, padding: pad4(20, 0, 0, 0), gap: '10px', border: { width: '2px 0px 0px 0px', color: C.ink, style: 'solid' } })
        await T(c.id, String(i + 1).padStart(2, '0'), TS.lab(C.orDk))
        await T(c.id, h, TS.h4(C.ink))
        await T(c.id, d, TS.body([16, 16, 16], C.g))
      }
    }
    // for whom
    {
      const { inner } = await section('Kenelle')
      const card = await F(inner.id, { name: 'Paneeli', backgroundColor: C.sea, borderRadius: '32px', padding: pad4(96, 64), stackAlignment: 'center' })
      ov(card.id, { padding: pad4(60, 32) }, { padding: pad4(44, 18) })
      await head(card.id, 'd2', 'Studio Luoto is', 'for renovation and HVAC firms.', C.paper, C.or, 'center', { maxWidth: '680px' })
      await gap(card.id, 56)
      const g = await grid(card.id, [3, 3, 1], '20px', D.FOR.length)
      for (const [h, d, k] of D.FOR) {
        const c = await F(g.id, { name: h, backgroundColor: C.paper, borderRadius: '24px', padding: pad4(16, 16, 30, 16), stackAlignment: 'center' })
        const il = await F(c.id, { name: 'Kuvitus', backgroundColor: C.sand, borderRadius: '16px', padding: pad4(14, 18, 4, 18) })
        await F(il.id, { name: k, backgroundImage: IMG['ill-' + k], aspectRatio: 440 / 380, height: null, layout: null })
        await gap(c.id, 22)
        await T(c.id, h, TS.lab(C.g, 'center'))
        await gap(c.id, 8)
        await T(c.id, d, TS.serif([26, 24, 22], C.ink, 'center', '1.15em'), { maxWidth: '420px' })
      }
    }
    // process
    {
      const { outer, inner } = await section('Prosessi')
      ANCHOR.Prosessi = outer.id
      await f.setAttributes(inner.id, { stackAlignment: 'center' })
      await T(inner.id, 'How it works', TS.lab(C.ink, 'center'))
      await gap(inner.id, 14)
      await head(inner.id, 'd2', 'From a message to a finished site.', 'Four steps.', C.ink, C.sea, 'center', { maxWidth: '720px' })
      await gap(inner.id, 64)
      const film = await hard(inner.id, { dx: 10, dy: 10, color: C.or, radius: 28, name: 'Video' }, { border: { width: '2px', color: C.ink, style: 'solid' }, backgroundColor: C.ink, overflow: 'hidden' })
      await comp(film.id, CODE.video, { webm: AMAP['/assets/luoto/video/prosessi-en.webm'], mp4: AMAP['/assets/luoto/video/prosessi-en.mp4'], kansikuva: AMAP['/assets/luoto/video/prosessi-en.jpg'], toista: 'Play', pysayta: 'Pause',
        kuvaus: 'Video, 40 seconds: Every evening someone looks for a renovation company on their phone. How it works: 1. Send a message. 2. Get a draft in 48 hours. 3. We change everything until the site is just right. 4. The site goes live, and we look after it for a monthly price.' }, { name: 'Prosessivideo' })
      await gap(inner.id, 72)
      const colors = { or: C.or, sea: C.sea, ink: C.ink, sand: C.sand }
      for (const [i, [h, d, c, k]] of D.STEPS.entries()) {
        const rw = await row(inner.id, { name: `Vaihe ${i + 1}`, gap: '110px', padding: pad4(48, 0) })
        ov(rw.id, { gap: '48px' }, { stackDirection: 'vertical', stackAlignment: 'start', gap: '28px', padding: pad4(28, 0) })
        const text = async () => {
          const tt = await F(rw.id, { name: 'Teksti', width: '1fr' }); ov(tt.id, null, { width: '100%' })
          await pill(tt.id, String(i + 1).padStart(2, '0'), C.ink, C.paper)
          await gap(tt.id, 18)
          await T(tt.id, h, TS.d3(C.ink))
          await gap(tt.id, 14)
          await T(tt.id, d, TS.body([18, 18, 17], C.g), { maxWidth: '440px' })
        }
        const panel = async () => {
          const pn = await F(rw.id, { name: 'Kuvitus', width: '1fr', backgroundColor: colors[c], borderRadius: '28px', padding: pad4(40, 40) })
          ov(pn.id, { padding: pad4(28, 28) }, { width: '100%', padding: pad4(18, 18) })
          await F(pn.id, { name: k, backgroundImage: IMG['ill-' + k], aspectRatio: 440 / 380, height: null, layout: null })
        }
        if (i % 2 === 0) { await text(); await panel() } else { await panel(); await text() }
      }
      await gap(inner.id, 56)
      await demo(inner.id, 'Request a free demo', 'musta')
      await gap(inner.id, 14)
      await T(inner.id, 'Free. No commitment.', TS.body([14, 14, 14], C.g, 'center'))
    }
    // you say, we do
    {
      const { inner } = await section('Hoidamme')
      const card = await F(inner.id, { name: 'Paneeli', backgroundColor: C.sand, borderRadius: '32px', padding: pad4(80, 80) })
      ov(card.id, { padding: pad4(48, 40) }, { padding: pad4(28, 20) })
      const [l, r] = await split(card.id, ['1.1fr', '0.9fr'])
      await head(l.id, 'd2', 'You say what you want.', 'We take care of the rest.', C.ink, C.sea)
      await T(r.id, 'A message, a photo or a call is enough. No logins and nothing to learn. We confirm when the change is live.', TS.body([20, 19, 18], C.g))
      await gap(card.id, 44)
      for (const [q, a, k] of D.REQ) {
        const rw = await row(card.id, { name: 'Pyyntö', gap: '20px', padding: pad4(20, 0), border: { width: '1px 0px 0px 0px', color: C.line, style: 'solid' } })
        ov(rw.id, { stackDirection: 'vertical', stackAlignment: 'start', gap: '10px' }, { stackDirection: 'vertical', stackAlignment: 'start', gap: '10px' })
        const qc = await F(rw.id, { name: 'Pyyntö', width: '1fr' }); ov(qc.id, { width: '100%' }, { width: '100%' })
        const bub = await hard(qc.id, { dx: 4, dy: 4, color: C.ink, radius: 22, width: '100%', name: 'Kupla' }, { padding: pad4(14, 20), backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' }, borderRadius: '22px 22px 22px 6px' })
        await f.setAttributes((await f.getParent(bub.id)).id, { maxWidth: '440px' })
        await T(bub.id, q, TS.serif([24, 22, 19], C.ink, 'left', '1.25em'))
        const arr = await F(rw.id, { name: 'Nuoli', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: C.ink, stackAlignment: 'center', stackDistribution: 'center' })
        ov(arr.id, { visible: false }, { visible: false })
        await icon(arr.id, IMG.arrowP, 18)
        const ac = await row(rw.id, { name: 'Tulos', width: '1fr', gap: '12px' }); ov(ac.id, { width: '100%' }, { width: '100%' })
        await dotIcon(ac.id, IMG.tick, C.or, 28, 14)
        await T(ac.id, a, TS.body([17, 17, 16], C.ink, 'left', 5), { width: '1fr' })
        const tg = await F(rw.id, { name: 'Aika', width: '176px', stackAlignment: 'end' }); ov(tg.id, { stackAlignment: 'start', width: '100%' }, { stackAlignment: 'start', width: '100%' })
        const tag = await row(tg.id, { name: 'Tagi', width: 'fit-content', padding: pad4(5, 12), borderRadius: '999px', border: { width: '1px', color: C.ink, style: 'solid' }, backgroundColor: k === 'big' ? C.ink : C.white })
        await T(tag.id, D.REQ_TAG[k], TS.body([13, 13, 13], k === 'big' ? C.paper : C.ink), { width: 'fit-content' })
      }
      await gap(card.id, 20)
      await T(card.id, 'Examples of everyday requests. Small changes are made within two working days, bigger ones in the monthly update. Everything is included in the price.', TS.body([14, 14, 14], C.g))
    }
    // first year
    {
      const { inner } = await section('Vuosi')
      await T(inner.id, 'After launch', TS.lab(C.ink))
      await gap(inner.id, 14)
      await head(inner.id, 'd2', 'On launch day the work begins.', 'This is how the first year goes.', C.ink, C.sea, 'left', { maxWidth: '880px' })
      await gap(inner.id, 56)
      const g = await grid(inner.id, [4, 2, 1], '36px 28px', D.YEAR1.length)
      for (const [i, [m, h, d]] of D.YEAR1.entries()) {
        const c = await F(g.id, { name: m, padding: pad4(30, 0, 0, 0), border: { width: '2px 0px 0px 0px', color: C.ink, style: 'solid' } })
        await F(c.id, { name: 'Piste', position: 'absolute', top: '-9px', left: '0px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: i === 0 ? C.or : C.paper, border: { width: '2px', color: C.ink, style: 'solid' }, layout: null })
        await pill(c.id, m, i === 0 ? C.or : C.ink, i === 0 ? C.ink : C.paper)
        await gap(c.id, 18)
        await T(c.id, h, TS.serif([30, 26, 24], C.ink, 'left', '1.15em'))
        await gap(c.id, 10)
        await T(c.id, d, TS.body([16, 16, 16], C.g))
      }
      await gap(inner.id, 48)
      const all = await row(inner.id, { name: 'Joka kuukausi', backgroundColor: C.ink, borderRadius: '24px', padding: pad4(22, 28), gap: '6px 20px', stackWrapEnabled: true })
      ov(all.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
      await T(all.id, 'Every month', TS.lab(C.or), { width: 'fit-content' })
      const allT = await T(all.id, 'A look at the numbers, one suggestion for improvement, and a reply to every message within one working day.', TS.body([17, 17, 16], C.paper), { width: '1fr' })
      ov(allT.id, null, { width: '100%' })
    }
    // pricing
    {
      const { outer, inner } = await section('Hinnat')
      ANCHOR.Hinnat = outer.id
      await f.setAttributes(inner.id, { stackAlignment: 'center' })
      await T(inner.id, 'Pricing', TS.lab(C.ink, 'center'))
      await gap(inner.id, 14)
      await head(inner.id, 'd2', 'One price.', 'Everything taken care of.', C.ink, C.sea, 'center', { maxWidth: '720px' })
      await gap(inner.id, 64)
      const pg = await grid(inner.id, [2, 1, 1], '24px', 2, { name: 'Hinta ja sisältö' })
      const pm = await hard(pg.id, { dx: 10, dy: 10, color: C.or, radius: 28, name: 'Hinta' }, { padding: pad4(52, 52), backgroundColor: C.ink })
      ov(pm.id, { padding: pad4(36, 36) }, { padding: pad4(28, 24) })
      await T(pm.id, 'Website as a service', TS.lab(C.gLt))
      await gap(pm.id, 18)
      const pn = await row(pm.id, { name: 'Hinta', gap: '10px', stackAlignment: 'end', width: 'fit-content' })
      await T(pn.id, D.PR.m, st('Price', { tag: 'p', font: 'serif', size: [112, 88, 64], lh: '0.95em', ls: '-0.03em', color: C.paper }), { width: 'fit-content' })
      await T(pn.id, '/month + VAT', TS.body([20, 20, 18], C.gLt), { width: 'fit-content' })
      await gap(pm.id, 14)
      await T(pm.id, '€0 setup fee. Free demo first.', TS.body([19, 19, 18], C.paper))
      await gap(pm.id, 8)
      const yr = await row(pm.id, { name: 'Vuosihinta', gap: '0px 6px', stackWrapEnabled: true })
      await T(yr.id, `or ${D.PR.y} + VAT a year`, TS.body([16, 16, 16], C.paper, 'left', 6), { width: 'fit-content' })
      await T(yr.id, '· two months free', TS.body([16, 16, 16], C.gLt), { width: 'fit-content' })
      await gap(pm.id, 28)
      await demo(pm.id, 'Request a free demo', 'oranssi')
      await gap(pm.id, 32)
      const tl = await F(pm.id, { name: 'Ehdot', border: { width: '1px 0px 0px 0px', color: C.lineLt, style: 'solid' } })
      for (const [b, s] of D.TERMS) {
        const rw = await row(tl.id, { name: 'Ehto', gap: '14px', stackAlignment: 'start', padding: pad4(12, 0), border: { width: '0px 0px 1px 0px', color: C.lineLt, style: 'solid' } })
        await T(rw.id, b, TS.body([16, 16, 15], C.or, 'left', 7), { width: '92px' })
        await T(rw.id, s, TS.body([16, 16, 15], C.gLt), { width: '1fr' })
      }
      await gap(pm.id, 14)
      const sm = await row(pm.id, { name: 'Pientä', gap: '0px 6px', stackWrapEnabled: true })
      await T(sm.id, 'The service is for businesses.', TS.body([14, 14, 14], C.gLt), { width: 'fit-content' })
      await T(sm.id, 'Terms', TS.link(C.paper, 14), { width: 'fit-content', link: route('terms', 'en') })
      const pi = await F(pg.id, { name: 'Sisältyy', padding: pad4(52, 52), borderRadius: '28px', backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' } })
      ov(pi.id, { padding: pad4(36, 36) }, { padding: pad4(28, 24) })
      await T(pi.id, 'Included in the price', TS.lab(C.g))
      await gap(pi.id, 14)
      for (const x of D.INCLUDED) {
        const rw = await row(pi.id, { name: 'Sisältyy', gap: '14px', stackAlignment: 'start', padding: pad4(11, 0), border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
        await dotIcon(rw.id, IMG.tick, C.or, 26, 14)
        await T(rw.id, x, TS.body([17, 17, 16], C.ink), { width: '1fr' })
      }
      await gap(pi.id, 28)
      await T(pi.id, 'Not included', TS.lab(C.g))
      await gap(pi.id, 12)
      for (const x of D.EXCLUDED) {
        const rw = await row(pi.id, { name: 'Ei sisälly', gap: '10px', padding: pad4(6, 0, 6, 4) })
        await F(rw.id, { name: 'Viiva', width: '12px', height: '2px', backgroundColor: C.g, layout: null })
        await T(rw.id, x, TS.body([16, 16, 15], C.g), { width: '1fr' })
      }
      await gap(inner.id, 24)
      const g = await grid(inner.id, [2, 2, 1], '24px', 2)
      const gu = await F(g.id, { name: 'Takuu', backgroundColor: C.or, borderRadius: '24px', padding: pad4(40, 40) }); ov(gu.id, { padding: pad4(28, 28) }, { padding: pad4(24, 24) })
      await pill(gu.id, 'Guarantee', C.ink, C.paper); await gap(gu.id, 16)
      await T(gu.id, 'Quote request guarantee', TS.d3(C.ink)); await gap(gu.id, 12)
      await T(gu.id, 'If the site brings in no quote requests in the first three months, the next three months are free.', TS.body([17, 17, 16], C.ink), { maxWidth: '520px' })
      const fi = await F(g.id, { name: 'Kolme ensimmäistä', backgroundColor: C.sea, borderRadius: '24px', padding: pad4(40, 40) }); ov(fi.id, { padding: pad4(28, 28) }, { padding: pad4(24, 24) })
      await pill(fi.id, 'First three clients', C.paper, C.ink); await gap(fi.id, 16)
      await T(fi.id, 'First month free', TS.d3(C.paper)); await gap(fi.id, 12)
      await T(fi.id, 'For the first three clients the first month is free, in return for a testimonial and permission to tell the story of the project on our site.', TS.body([17, 17, 16], C.paper), { maxWidth: '520px' })
    }
    // client asks
    {
      const { inner } = await section('Vastaukset')
      const [l, r] = await split(inner.id, ['1.1fr', '0.9fr'])
      await head(l.id, 'd2', 'Your client asks.', 'The site answers.', C.ink, C.sea)
      await T(r.id, 'These are the things a client wants to know before asking for a quote. When the answers are on the site, the phone rings more often, and about the right things.', TS.body([20, 19, 18], C.g))
      await gap(inner.id, 48)
      const list = await F(inner.id, { name: 'Kysymykset', border: { width: '2px 0px 0px 0px', color: C.ink, style: 'solid' } })
      for (const [c, q, a] of D.ASKS) {
        const rw = await row(list.id, { name: c, gap: '28px', padding: pad4(22, 0), border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
        ov(rw.id, { stackDirection: 'vertical', stackAlignment: 'start', gap: '8px' }, { stackDirection: 'vertical', stackAlignment: 'start', gap: '8px' })
        const lc = await T(rw.id, c, TS.lab(C.g), { width: '160px' }); ov(lc.id, { width: '100%' }, { width: '100%' })
        const qc = await T(rw.id, `“${q}”`, TS.serif([30, 26, 22], C.ink), { width: '1.2fr' }); ov(qc.id, { width: '100%' }, { width: '100%' })
        const ac = await row(rw.id, { name: 'Vastaus', width: '1fr', gap: '12px' }); ov(ac.id, { width: '100%' }, { width: '100%' })
        await dotIcon(ac.id, IMG.tick, C.or, 28, 14)
        await T(ac.id, a, TS.body([17, 17, 16], C.g), { width: '1fr' })
      }
    }
    // why
    {
      const { inner } = await section('Miksi')
      await head(inner.id, 'd2', 'Why your current site does not bring in work.', 'And what we do about it.', C.ink, C.sea, 'left', { maxWidth: '820px' })
      await gap(inner.id, 48)
      const g = await grid(inner.id, [4, 2, 1], '22px', D.PAINS.length)
      for (const [i, [p, d]] of D.PAINS.entries()) {
        const c = await hard(g.id, { dx: 6, dy: 6, color: C.ink, radius: 22, name: 'Syy' }, { padding: pad4(24, 24, 28, 24), backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' } })
        await pill(c.id, String(i + 1).padStart(2, '0'), C.or, C.ink)
        await gap(c.id, 18)
        await T(c.id, p, TS.h4(C.ink))
        await gap(c.id, 10)
        await T(c.id, d, TS.body([16, 16, 16], C.g))
      }
    }
    // quote + band
    {
      const { inner } = await section('Asiakkaan sanoin')
      const q = await hard(inner.id, { dx: 10, dy: 10, color: C.or, radius: 32, name: 'Lainaus' }, { padding: pad4(88, 88), backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' } })
      ov(q.id, { padding: pad4(56, 48) }, { padding: pad4(36, 24) })
      await T(q.id, 'In a client’s words', TS.lab(C.g))
      await gap(q.id, 22)
      await T(q.id, '“Ville made a site that gets people excited about BuffBird even before launch.”', st('Quote', { tag: 'p', font: 'serif', size: [56, 44, 30], lh: '1.1em', ls: '-0.02em' }), { maxWidth: '900px' })
      await gap(q.id, 32)
      const fc = await row(q.id, { name: 'Lähde', gap: '14px', width: 'fit-content' })
      await F(fc.id, { name: 'Kuva', width: '52px', height: '52px', borderRadius: '50%', backgroundImage: IMG.valtteri, layout: null })
      const ft = await F(fc.id, { name: 'Nimi', width: 'fit-content' })
      await T(ft.id, 'Valtteri Viitala', TS.body([15, 15, 15], C.ink, 'left', 6), { width: 'fit-content' })
      await T(ft.id, 'CEO, BuffBird Oy. Translated from Finnish.', TS.body([15, 15, 15], C.g), { width: 'fit-content' })
      await gap(inner.id, 64)
      const b = await row(inner.id, { name: 'Työt-kaista', stackDistribution: 'space-between', gap: '20px 32px', stackWrapEnabled: true, padding: pad4(30, 0), border: { width: '1px 0px 1px 0px', color: C.line, style: 'solid' } })
      ov(b.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
      const bt = await T(b.id, 'See what this looks like finished.', TS.d3(C.ink), { width: 'fit-content' })
      ov(bt.id, null, { width: '100%' })
      await button(b.id, 'Latest work', route('works', 'en'), 'ink')
    }
    // faq
    {
      const { outer, inner } = await section('Kysymykset')
      ANCHOR.Kysymykset = outer.id
      const [l, r] = await split(inner.id, ['0.8fr', '1.2fr'], { stackAlignment: 'start', gap: '64px', vgap: '32px' })
      await T(l.id, 'Frequently asked', TS.d2(C.ink))
      await comp(r.id, CODE.ukk, { kysymykset: D.FAQ.map(([kysymys, vastaus]) => ({ kysymys, vastaus })) }, { name: 'Usein kysytyt' })
    }
    // founder
    {
      const { inner } = await section('Ville')
      const card = await row(inner.id, { name: 'Perustaja', backgroundColor: C.sand, borderRadius: '32px', padding: pad4(56, 56), gap: '56px' })
      ov(card.id, { padding: pad4(40, 40), gap: '40px' }, { stackDirection: 'vertical', stackAlignment: 'start', padding: pad4(24, 24), gap: '28px' })
      const img = await F(card.id, { name: 'Ville Saarela', width: '300px', aspectRatio: 1, height: null, borderRadius: '24px', backgroundImage: IMG.ville, layout: null })
      ov(img.id, { width: '240px' }, { width: '100%' })
      const tx = await F(card.id, { name: 'Teksti', width: '1fr' }); ov(tx.id, null, { width: '100%' })
      await head(tx.id, 'd2', 'Still have questions?', 'Ask Ville directly.', C.ink, C.sea)
      await gap(tx.id, 16)
      await T(tx.id, 'You get your answer straight from Ville, the founder of Studio Luoto, who gets to know your business. After launch too.', TS.body([18, 18, 17], C.g), { maxWidth: '520px' })
      await gap(tx.id, 28)
      const d = await row(tx.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true })
      await button(d.id, 'Call ' + TEL_H, 'tel:' + TEL, 'or')
      await T(d.id, MAIL, TS.link(C.ink), { width: 'fit-content', link: 'mailto:' + MAIL })
    }
    const yh = await contact()
    ANCHOR.Yhteys = yh.id
    ANCHOR.Alku = hero.id
    HOME.en = Object.fromEntries(['Alku', 'Palvelu', 'Prosessi', 'Hinnat', 'Kysymykset', 'Yhteys'].map(k => [k, pageLink(page.id, ANCHOR[k])]))
    await f.setAttributes(ANCHOR.palveluLink.id, { link: HOME.en.Yhteys, linkOpenInNewTab: false })
    const { hdr } = await header('/', HOME.en.Yhteys)
    await footer(page, hero.id, '/')
    return finishPage(page, hdr)
  }

  // =================== run ===================
  for (const job of jobs) {
    const t0 = Date.now()
    let m
    if (job === 'en') await homePage()
    else if ((m = job.match(/^works-(fi|en)$/))) { L = m[1]; await worksPage() }
    else if ((m = job.match(/^project-(fi|en)-(.+)$/))) { L = m[1]; await projectPage(m[2]) }
    else if ((m = job.match(/^(privacy|terms)-(fi|en)$/))) { L = m[2]; await docPage(m[1]) }
    else if (job === '404') await notFound()
    else { log('unknown job', job); continue }
    log('done', job, Math.round((Date.now() - t0) / 1000) + 's')
  }
} catch (e) {
  console.log('ERR', e.message, (e.stack || '').split('\n').slice(0, 4).join(' | '))
} finally { await f.disconnect() }
