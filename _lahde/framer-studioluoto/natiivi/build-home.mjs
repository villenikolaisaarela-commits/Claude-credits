// Studio Luoto front page, built from Framer's own layers so every text can be edited on the canvas.
// node build-home.mjs  (reads FRAMER_API_KEY)
import { connect } from 'framer-api'
import fs from 'fs'
import * as K from './comps.mjs'

const HERE = new URL('.', import.meta.url).pathname
const PROJECT = 'https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj'
const KEY = process.env.FRAMER_API_KEY
const AMAP = JSON.parse(fs.readFileSync(HERE + '../assets-map.json', 'utf8'))
const D = JSON.parse(fs.readFileSync(HERE + 'data-fi.json', 'utf8'))
const PATH = process.argv[2] || '/'

const C = { ink: '#0F0F0E', paper: '#F4F1EA', sand: '#E8E1D2', white: '#FFFFFF', sea: '#0E3B3A', or: '#FF5B1F', orDk: '#B83A0C', g: '#5C5850', gLt: '#B5B0A6', line: 'rgba(15, 15, 14, 0.14)', lineLt: 'rgba(244, 241, 234, 0.16)' }
const MAIL = 'ville@studioluoto.com', TEL = '+358451035362', TEL_H = '045 103 5362'

const f = await connect(PROJECT, KEY)
const log = (...a) => console.log(...a)
const OV = []          // breakpoint overrides: [nodeId, {tablet}, {phone}]
const ov = (id, tablet, phone) => OV.push([id, tablet || null, phone || null])

try {
  // ---------- page ----------
  // a clean page every time: the old one goes, with its breakpoints
  let page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === PATH)
  if (page && PATH !== '/') { await f.removeNode(page.id); page = null }
  if (!page) page = await f.createWebPage(PATH)
  // the home page cannot be removed, so empty it and check that it really is empty
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
  if (bps.length !== 1 || (await f.getChildren(bps[0].id)).length) throw new Error('page did not empty: ' + bps.map(b => b.name).join(','))
  const desk = bps[0]
  log('page', page.id, 'desktop', desk.id, bps.length)
  await f.setAttributes(desk.id, { layout: 'stack', stackDirection: 'vertical', stackAlignment: 'center', gap: '0px', padding: '0px', height: 'fit-content', backgroundColor: C.paper, overflow: 'hidden' })
  const P = desk.id

  // ---------- fonts and text styles ----------
  const font = {
    serif: await f.getFont('Newsreader', { weight: 500 }),
    sans4: await f.getFont('Archivo', { weight: 400 }), sans5: await f.getFont('Archivo', { weight: 500 }),
    sans6: await f.getFont('Archivo', { weight: 600 }), sans7: await f.getFont('Archivo', { weight: 700 }),
  }
  // every build makes its own set of styles; the old sets are removed once the page no longer uses them
  const STYLE_DIR = '/Luoto ' + Date.now().toString(36) + '/'
  const styleCache = new Map()
  async function st(name, o) {
    const key = JSON.stringify([name, o])
    if (styleCache.has(key)) return styleCache.get(key)
    const [d, t, p] = o.size
    const s = await (a => f.createTextStyle({ path: STYLE_DIR + name, ...a }))({
      tag: o.tag || 'p', font: font[o.font], fontSize: d + 'px', lineHeight: o.lh || '1.55em', letterSpacing: o.ls || '0em',
      color: o.color || C.ink, alignment: o.align || 'left', transform: o.upper ? 'uppercase' : 'none', decoration: o.under ? 'underline' : 'none', balance: !!o.balance,
      minWidth: 1200, breakpoints: [{ minWidth: 1200, fontSize: t + 'px' }, { minWidth: 810, fontSize: p + 'px' }], // Framer: minWidth is the top of the range
    })
    styleCache.set(key, s); return s
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

  // ---------- assets ----------
  const svg = n => fs.readFileSync(HERE + 'svg/' + n)
  const up = async (name, bytes, mime) => f.uploadImage({ image: { bytes: new Uint8Array(bytes), mimeType: mime }, name })
  const upUrl = async (p, name) => f.uploadImage({ image: AMAP[p] || ('https://www.studioluoto.com' + p), name: name || p.split('/').pop() })
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

  // ---------- code components ----------
  const fonts = K.fontsCSS(AMAP)
  const codeFiles = await f.getCodeFiles()
  async function code(name, src) {
    const ex = codeFiles.find(c => c.name === name + '.tsx' || c.name === name)
    const file = ex ? await ex.setFileContent(src) : await f.createCodeFile(name + '.tsx', src)
    return file.exports.find(e => e.type === 'component').insertURL
  }
  const CODE = {
    marq: await code('Liukurivi', K.liukurivi(fonts, AMAP['/assets/luoto/luoto-merkki-musta.svg'])),
    video: await code('Prosessivideo', K.video()),
    ukk: await code('Kysymykset', K.ukk(fonts)),
    demo: await code('DemoNappi', K.demonappi(fonts, MAIL, TEL, TEL_H)),
  }
  async function comp(parent, url, controls, attrs = {}) {
    const n = await f.addComponentInstance({ url, parentId: parent })
    await f.setAttributes(n.id, { position: 'relative', top: null, left: null, width: '100%', height: 'fit-content', ...attrs, controls })
    return n
  }
  const demo = (parent, teksti, tyyli, extra = {}) => comp(parent, CODE.demo, { teksti, tyyli, ...extra }, { width: 'fit-content', name: 'Demopyyntö-nappi' })
  log('code ok')

  // ---------- layer helpers ----------
  const GRIDS = new Set()
  const CELL = { gridItemFillCellWidth: true, gridItemFillCellHeight: true, gridItemVerticalAlignment: 'start', gridItemHorizontalAlignment: 'start' }
  // inside a grid every item fills its cell and starts at the top, so a row of cards is one height
  const F = (parent, a = {}) => f.createFrameNode({ position: 'relative', width: '100%', height: 'fit-content', layout: 'stack', stackDirection: 'vertical', stackAlignment: 'start', stackDistribution: 'start', gap: '0px', backgroundColor: null, ...(GRIDS.has(parent) ? CELL : {}), ...a }, parent)
  const row = (parent, a = {}) => F(parent, { stackDirection: 'horizontal', stackAlignment: 'center', ...a })
  async function T(parent, text, style, a = {}) {
    const n = await f.createTextNode({ position: 'relative', width: '100%', height: 'fit-content', ...a }, parent)
    await n.setText(text); await f.setAttributes(n.id, { inlineTextStyle: await style })
    return n
  }
  const gap = (parent, px, name) => F(parent, { name: name || 'Väli', height: px + 'px', width: '100%' })
  const pad4 = (a, b, c, d) => `${a}px ${b}px ${c === undefined ? a : c}px ${d === undefined ? b : d}px`
  // a page-width band with the 12-column wrap inside
  async function band(name, a = {}) {
    const outer = await F(P, { name, stackAlignment: 'center', ...a })
    const inner = await F(outer.id, { name: name + ' · sisältö', maxWidth: '1416px', padding: pad4(0, 48) })
    ov(inner.id, { padding: pad4(0, 32) }, { padding: pad4(0, 16) })
    return { outer, inner }
  }
  const SEC = [160, 104, 96]
  async function section(name, a = {}) {
    const b = await band(name, { padding: pad4(SEC[0], 0, 0, 0), ...a })
    ov(b.outer.id, { padding: pad4(SEC[1], 0, 0, 0) }, { padding: pad4(SEC[2], 0, 0, 0) })
    return b
  }
  // a card with a hard offset shadow, the way the site draws it
  async function hard(parent, { dx = 0, dy = 6, color = C.ink, radius = 22, width = '100%', rotation = 0, name = 'Kortti' }, inner = {}) {
    // in a grid the wrapper is itself a one-cell grid, so the card stretches to the row without losing its own height
    const inGrid = GRIDS.has(parent)
    const cell = inGrid ? { layout: 'grid', gridColumnCount: 1, gridRowCount: 1, gridColumnWidthType: 'minmax', gridColumnMinWidth: 1, gridRowHeightType: 'auto', gridAlignment: 'start', gap: '0px' } : {}
    const w = await F(parent, { name: name + ' · varjolla', width, rotation, padding: pad4(0, Math.max(dx, 0), Math.max(dy, 0), 0), ...cell })
    await F(w.id, { name: 'Varjo', position: 'absolute', top: dy + 'px', left: dx + 'px', right: '0px', bottom: '0px', width: null, height: null, backgroundColor: color, borderRadius: radius + 'px', layout: null })
    if (inGrid) GRIDS.add(w.id)
    const card = await F(w.id, { name, borderRadius: radius + 'px', ...inner })
    return card
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
  // a heading whose last sentence is coloured: two text layers, the coloured one on its own line
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
  // two or more columns side by side on desktop, stacked below
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
  const ANCHOR = {}

  // =================== HEADER (fixed pill) ===================
  const hdr = await F(P, { name: 'Ylätunniste', padding: pad4(0, 12), zIndex: 100, stackAlignment: 'center' })
  await f.setAttributes(hdr.id, { position: 'fixed', top: '14px', left: '0px', right: '0px', width: null })
  const pillNav = await row(hdr.id, { name: 'Valikko', maxWidth: '1180px', height: '64px', gap: '20px', padding: pad4(0, 10, 0, 24), borderRadius: '999px', backgroundColor: 'rgba(244, 241, 234, 0.94)', border: { width: '1px', color: C.line, style: 'solid' } })
  const logoBox = await row(pillNav.id, { name: 'Logo', width: '1fr', link: '/' })
  await F(logoBox.id, { name: 'Studio Luoto', width: '140px', height: '21px', backgroundImage: IMG.logo, layout: null })
  const navLinks = await row(pillNav.id, { name: 'Linkit', width: 'fit-content', gap: '30px' })
  ov(navLinks.id, { visible: false }, { visible: false })
  const NAV = [['Palvelu', 'palvelu'], ['Näin se toimii', 'prosessi'], ['Hinnat', 'hinnat'], ['Työt', '/tyot'], ['Kysymykset', 'kysymykset']]
  const navNodes = []
  for (const [t, k] of NAV) { const box = await row(navLinks.id, { name: t, width: 'fit-content', height: '44px' }); await T(box.id, t, st('Nav', { font: 'sans5', size: [15, 15, 15], lh: '1.2em' }), { width: 'fit-content' }); navNodes.push([box, k]) }
  const lang = await row(pillNav.id, { name: 'Kieli', width: '44px', height: '44px', borderRadius: '999px', border: { width: '1px', color: C.line, style: 'solid' }, stackDistribution: 'center', link: '/en' })
  await T(lang.id, 'EN', st('Lang', { font: 'sans6', size: [14, 14, 14], lh: '1em', ls: '0.04em', align: 'center' }), { width: 'fit-content' })
  const navCta = await row(pillNav.id, { name: 'Pyydä demo', width: 'fit-content', height: '44px', padding: pad4(0, 20), borderRadius: '999px', backgroundColor: C.ink })
  await T(navCta.id, 'Pyydä demo', st('Nav CTA', { font: 'sans6', size: [15, 15, 14], lh: '1em', color: C.paper }), { width: 'fit-content' })
  log('header')

  // =================== HERO ===================
  const hero = await F(P, { name: 'Alku', backgroundColor: C.ink, backgroundImage: IMG.kartta, padding: pad4(210, 48, 130, 48), stackAlignment: 'center' })
  ov(hero.id, { padding: pad4(170, 32, 100, 32) }, { padding: pad4(150, 16, 80, 16) })
  const heroIn = await F(hero.id, { name: 'Sisältö', maxWidth: '1120px', stackAlignment: 'center' })
  const hl = await row(heroIn.id, { name: 'Yläteksti', width: 'fit-content', gap: '10px', padding: pad4(8, 16), borderRadius: '999px', border: { width: '1px', color: C.lineLt, style: 'solid' } })
  await F(hl.id, { name: 'Piste', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.or, layout: null })
  await T(hl.id, 'Verkkosivut palveluna remontti- ja LVI-yrityksille', TS.body([14, 14, 14], C.gLt, 'left', 5), { width: 'fit-content' })
  await gap(heroIn.id, 28)
  await head(heroIn.id, 'd1', 'Verkkosivut, jotka tuovat remontti\u00adyrityksellesi', 'lisää tarjous\u00adpyyntöjä.', C.paper, C.or, 'center')
  await gap(heroIn.id, 28)
  await T(heroIn.id, 'Me vastaamme siitä, että sivusi tuovat töitä. Rakennamme, ylläpidämme ja kehitämme ne kuukausihinnalla, eikä sinun tarvitse lähteä työmaalta.', TS.body([21, 19, 18], C.gLt, 'center'), { maxWidth: '560px' })
  await gap(heroIn.id, 40)
  const heroDo = await row(heroIn.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true, stackDistribution: 'center' })
  await demo(heroDo.id, 'Pyydä ilmainen demo', 'oranssi')
  await T(heroDo.id, 'Katso työt', TS.link(C.paper), { width: 'fit-content', link: '/tyot' })
  await gap(heroIn.id, 64)
  const proof = await grid(heroIn.id, [3, 1, 1], '20px', 3, { name: 'Todisteet', maxWidth: '1150px' })
  const PROOF = [['48 h', 'Ilmainen demo 48 tunnissa', 'Toimiva etusivu, ei kuva. Ei sido mihinkään.', 0], ['€', '199 €/kk, kaikki hoidossa', 'Ei aloitusmaksua. Muutokset ja ylläpito mukana.', 0], [null, '”Sivut saavat ihmiset innostumaan jo ennen julkaisua.”', 'Valtteri Viitala, BuffBird Oy', 0]]
  for (const [ic, b, s, rot] of PROOF) {
    const card = await hard(proof.id, { dy: 6, color: C.or, radius: 18, name: 'Todiste' }, { stackDirection: 'horizontal', stackAlignment: 'center', gap: '14px', padding: pad4(14, 22, 14, 14), backgroundColor: C.white })
    if (ic) { const box = await F(card.id, { name: 'Ikoni', width: '52px', height: '52px', borderRadius: '14px', backgroundColor: C.or, stackAlignment: 'center', stackDistribution: 'center' }); await T(box.id, ic, st('Proof icon', { font: 'sans7', size: [15, 15, 15], lh: '1em', align: 'center' }), { width: 'fit-content' }) }
    else await F(card.id, { name: 'Kuva', width: '52px', height: '52px', borderRadius: '50%', backgroundImage: IMG.valtteri, layout: null })
    const tx = await F(card.id, { name: 'Teksti', width: '1fr', gap: '2px' })
    await T(tx.id, b, st('Proof bold', { font: 'sans6', size: [15, 15, 15], lh: '1.35em' }))
    await T(tx.id, s, TS.body([13, 13, 13], C.g))
  }
  log('hero')

  // =================== TRADES ===================
  const tr = await F(P, { name: 'Alat', padding: pad4(30, 0, 32, 0), stackAlignment: 'center', gap: '18px', border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
  await T(tr.id, 'Teemme sivuja näille aloille', TS.lab(C.g, 'center'))
  await comp(tr.id, CODE.marq, { rivit: D.TRADES, nopeus: 48 }, { name: 'Liukurivi' })

  // =================== PROBLEM ===================
  {
    const { outer, inner } = await section('Ongelma')
    const card = await F(inner.id, { name: 'Kortti', backgroundColor: C.ink, borderRadius: '32px', padding: pad4(110, 80), stackAlignment: 'center' })
    ov(card.id, { padding: pad4(70, 40) }, { padding: pad4(44, 22) })
    await T(card.id, 'Ongelma', TS.lab(C.gLt, 'center'))
    await gap(card.id, 18)
    await head(card.id, 'd2', 'Useimmat remonttisivut näyttävät siisteiltä.', 'Tarjous\u00adpyyntöjä ne eivät tuo.', C.paper, C.or, 'center', { maxWidth: '760px' })
    await gap(card.id, 28)
    await T(card.id, 'Sivut tehtiin kerran, eikä kukaan ole katsonut niitä sen jälkeen. Asiakas vertaa illalla kolmea yritystä puhelimella ja soittaa sille, jonka sivuilta vastaukset löytyvät.', TS.body([18, 18, 17], C.gLt, 'center'), { maxWidth: '600px' })
    await gap(card.id, 18)
    await T(card.id, 'Sivusi päättävät, soitetaanko sinulle vai kilpailijalle.', TS.body([18, 18, 17], C.paper, 'center', 6))
    await gap(card.id, 48)
    const stk = await row(card.id, { name: 'Tarrat', maxWidth: '900px', gap: '18px 14px', stackWrapEnabled: true, stackDistribution: 'center' })
    for (const [i, s] of D.STICKERS.entries()) {
      const n = i + 1, rot = n % 3 === 0 ? -1 : n % 2 === 0 ? 2.5 : -3
      const c = await hard(stk.id, { dy: 4, color: C.orDk, radius: 999, width: 'fit-content', rotation: rot, name: 'Tarra' }, { padding: pad4(12, 22), backgroundColor: C.or, width: 'fit-content' })
      await T(c.id, s, st('Sticker', { font: 'sans7', size: [14, 14, 13], lh: '1.2em', ls: '0.06em', upper: true }), { width: 'fit-content' })
    }
  }
  log('problem')

  // =================== SERVICE (ink, shoreline) ===================
  {
    await gap(P, 200, 'Väli ennen rantaa')
    const sh = await F(P, { name: 'Ranta', height: '66px', backgroundImage: IMG.shore5, layout: null })
    ov(sh.id, { height: '50px' }, { height: '34px' })
    const { outer, inner } = await band('Palvelu', { backgroundColor: C.ink, padding: pad4(110, 0, 150, 0) })
    ov(outer.id, { padding: pad4(90, 0, 110, 0) }, { padding: pad4(72, 0, 88, 0) })
    ANCHOR.palvelu = outer.id
    await head(inner.id, 'd2', 'Mitä teemme sivuillesi.', 'Joka kuukausi.', C.paper, C.or, 'left', { maxWidth: '900px' })
    await gap(inner.id, 24)
    await T(inner.id, 'Jokaisella sivulla on yksi tehtävä: oikea asiakas löytää sinut ja pyytää tarjouksen.', TS.body([20, 19, 18], C.gLt), { maxWidth: '600px' })
    await gap(inner.id, 64)
    const g = await grid(inner.id, [5, 2, 1], '36px 28px', D.DO.length)
    for (const [i, [k, h, d]] of D.DO.entries()) {
      const c = await F(g.id, { name: k, padding: pad4(20, 0, 0, 0), gap: '12px', border: { width: '2px 0px 0px 0px', color: C.or, style: 'solid' } })
      await T(c.id, `${String(i + 1).padStart(2, '0')} / ${k}`, TS.lab(C.or))
      await T(c.id, h, TS.h4(C.paper))
      await T(c.id, d, TS.body([16, 16, 16], C.gLt))
    }
    await gap(inner.id, 48)
    ANCHOR.palveluLink = await T(inner.id, 'Pyydä demo, niin näet sen omilla sivuillasi →', TS.link(C.paper), { width: 'fit-content' })
  }
  log('service')

  // =================== PARTNER ===================
  {
    const { inner } = await section('Kumppani')
    const [l, r] = await split(inner.id, ['1.1fr', '0.9fr'])
    await T(l.id, 'Verkkosivut palveluna', TS.lab(C.ink))
    await gap(l.id, 14)
    await head(l.id, 'd2', 'Toimisto julkaisee sivut ja siirtyy seuraavaan.', 'Me jäämme.', C.ink, C.sea)
    await T(r.id, 'Sivut eivät ole valmiit julkaisupäivänä. Siksi emme laskuta projektia, vaan pidämme sivut kunnossa ja kehitämme niitä kuukausihinnalla.', TS.body([20, 19, 18], C.g))
    await gap(inner.id, 48)
    const g = await grid(inner.id, [2, 1, 1], '28px', 2)
    const [old, nu] = D.VS
    const a = await F(g.id, { name: 'Tavallinen toimisto', padding: pad4(44, 44), borderRadius: '28px', border: { width: '2px', color: C.line, style: 'solid' } })
    ov(a.id, null, { padding: pad4(24, 24) })
    await T(a.id, 'Tavallinen toimisto', TS.lab(C.g))
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
    await T(inner.id, 'Kasvukumppani tarkoittaa käytännössä tätä.', TS.d3(C.ink), { maxWidth: '620px' })
    await gap(inner.id, 32)
    const pg = await grid(inner.id, [3, 2, 1], '32px 40px', D.PERKS.length)
    for (const [i, [h, d]] of D.PERKS.entries()) {
      const c = await F(pg.id, { name: h, padding: pad4(20, 0, 0, 0), gap: '10px', border: { width: '2px 0px 0px 0px', color: C.ink, style: 'solid' } })
      await T(c.id, String(i + 1).padStart(2, '0'), TS.lab(C.orDk))
      await T(c.id, h, TS.h4(C.ink))
      await T(c.id, d, TS.body([16, 16, 16], C.g))
    }
  }
  log('partner')

  // =================== FOR WHOM (sea) ===================
  {
    const { inner } = await section('Kenelle')
    const card = await F(inner.id, { name: 'Paneeli', backgroundColor: C.sea, borderRadius: '32px', padding: pad4(96, 64), stackAlignment: 'center' })
    ov(card.id, { padding: pad4(60, 32) }, { padding: pad4(44, 18) })
    await head(card.id, 'd2', 'Studio Luoto on', 'remontti- ja LVI-yrityksille.', C.paper, C.or, 'center', { maxWidth: '680px' })
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
  log('for')

  // =================== PROCESS ===================
  {
    const { outer, inner } = await section('Prosessi')
    ANCHOR.prosessi = outer.id
    await f.setAttributes(inner.id, { stackAlignment: 'center' })
    await T(inner.id, 'Näin se toimii', TS.lab(C.ink, 'center'))
    await gap(inner.id, 14)
    await head(inner.id, 'd2', 'Viestistä valmiisiin sivuihin.', 'Neljä vaihetta.', C.ink, C.sea, 'center', { maxWidth: '720px' })
    await gap(inner.id, 64)
    const film = await hard(inner.id, { dx: 10, dy: 10, color: C.or, radius: 28, name: 'Video' }, { border: { width: '2px', color: C.ink, style: 'solid' }, backgroundColor: C.ink, overflow: 'hidden' })
    await comp(film.id, CODE.video, { webm: AMAP['/assets/luoto/video/prosessi.webm'], mp4: AMAP['/assets/luoto/video/prosessi.mp4'], kansikuva: AMAP['/assets/luoto/video/prosessi.jpg'], toista: 'Toista', pysayta: 'Pysäytä',
      kuvaus: 'Video, 40 sekuntia: Joka ilta joku etsii remonttia puhelimellaan. Näin se toimii: 1. Lähetä viesti. 2. Saat luonnoksen 48 tunnissa. 3. Muutamme kaiken, kunnes sivut ovat juuri oikein. 4. Sivut julkaistaan, ja pidämme niistä huolen kuukausihinnalla.' }, { name: 'Prosessivideo' })
    await gap(inner.id, 72)
    const colors = { or: C.or, sea: C.sea, ink: C.ink, sand: C.sand }
    for (const [i, [h, d, c, k]] of D.STEPS.entries()) {
      const rw = await row(inner.id, { name: `Vaihe ${i + 1}`, gap: '110px', padding: pad4(48, 0) })
      ov(rw.id, { gap: '48px' }, { stackDirection: 'vertical', stackAlignment: 'start', gap: '28px', padding: pad4(28, 0) })
      const text = async () => {
        const t = await F(rw.id, { name: 'Teksti', width: '1fr' }); ov(t.id, null, { width: '100%' })
        await pill(t.id, String(i + 1).padStart(2, '0'), C.ink, C.paper)
        await gap(t.id, 18)
        await T(t.id, h, TS.d3(C.ink))
        await gap(t.id, 14)
        await T(t.id, d, TS.body([18, 18, 17], C.g), { maxWidth: '440px' })
      }
      const panel = async () => {
        const pn = await F(rw.id, { name: 'Kuvitus', width: '1fr', backgroundColor: colors[c], borderRadius: '28px', padding: pad4(40, 40) })
        ov(pn.id, { padding: pad4(28, 28) }, { width: '100%', padding: pad4(18, 18) })
        await F(pn.id, { name: k, backgroundImage: IMG['ill-' + k], aspectRatio: 440 / 380, height: null, layout: null })
      }
      if (i % 2 === 0) { await text(); await panel() } else { await panel(); await text() }
    }
    await gap(inner.id, 56)
    await demo(inner.id, 'Pyydä ilmainen demo', 'musta')
    await gap(inner.id, 14)
    await T(inner.id, 'Maksuton. Ei sido mihinkään.', TS.body([14, 14, 14], C.g, 'center'))
  }
  log('process')

  // =================== YOU SAY, WE DO ===================
  {
    const { inner } = await section('Hoidamme')
    const card = await F(inner.id, { name: 'Paneeli', backgroundColor: C.sand, borderRadius: '32px', padding: pad4(80, 80) })
    ov(card.id, { padding: pad4(48, 40) }, { padding: pad4(28, 20) })
    const [l, r] = await split(card.id, ['1.1fr', '0.9fr'])
    await head(l.id, 'd2', 'Sinä sanot, mitä haluat.', 'Me hoidamme loput.', C.ink, C.sea)
    await T(r.id, 'Viesti, kuva tai puhelu riittää. Ei kirjautumisia eikä opeteltavaa. Kuittaamme, kun muutos on sivuilla.', TS.body([20, 19, 18], C.g))
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
    await T(card.id, 'Esimerkkejä tavallisista pyynnöistä. Pienet muutokset tehdään kahdessa arkipäivässä, isommat kuukauden päivityksessä. Kaikki sisältyy hintaan.', TS.body([14, 14, 14], C.g))
  }
  log('requests')

  // =================== FIRST YEAR ===================
  {
    const { inner } = await section('Vuosi')
    await T(inner.id, 'Julkaisun jälkeen', TS.lab(C.ink))
    await gap(inner.id, 14)
    await head(inner.id, 'd2', 'Julkaisupäivänä työ vasta alkaa.', 'Näin ensimmäinen vuosi etenee.', C.ink, C.sea, 'left', { maxWidth: '880px' })
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
    await T(all.id, 'Joka kuukausi', TS.lab(C.or), { width: 'fit-content' })
    const allT = await T(all.id, 'Katsaus luvuista, yksi parannusehdotus ja vastaus jokaiseen viestiin yhden arkipäivän sisällä.', TS.body([17, 17, 16], C.paper), { width: '1fr' })
    ov(allT.id, null, { width: '100%' })
  }
  log('year')

  // =================== PRICING ===================
  {
    const { outer, inner } = await section('Hinnat')
    ANCHOR.hinnat = outer.id
    await f.setAttributes(inner.id, { stackAlignment: 'center' })
    await T(inner.id, 'Hinnat', TS.lab(C.ink, 'center'))
    await gap(inner.id, 14)
    await head(inner.id, 'd2', 'Yksi hinta.', 'Kaikki hoidossa.', C.ink, C.sea, 'center', { maxWidth: '720px' })
    await gap(inner.id, 64)
    const pg = await grid(inner.id, [2, 1, 1], '24px', 2, { name: 'Hinta ja sisältö' })
    const pm = await hard(pg.id, { dx: 10, dy: 10, color: C.or, radius: 28, name: 'Hinta' }, { padding: pad4(52, 52), backgroundColor: C.ink })
    ov(pm.id, { padding: pad4(36, 36) }, { padding: pad4(28, 24) })
    await T(pm.id, 'Verkkosivut palveluna', TS.lab(C.gLt))
    await gap(pm.id, 18)
    const pn = await row(pm.id, { name: 'Hinta', gap: '10px', stackAlignment: 'end', width: 'fit-content' })
    await T(pn.id, D.PR.m, st('Price', { tag: 'p', font: 'serif', size: [112, 88, 64], lh: '0.95em', ls: '-0.03em', color: C.paper }), { width: 'fit-content' })
    await T(pn.id, '/kk + alv', TS.body([20, 20, 18], C.gLt), { width: 'fit-content' })
    await gap(pm.id, 14)
    await T(pm.id, '0 € aloitusmaksu. Ilmainen demo ensin.', TS.body([19, 19, 18], C.paper))
    await gap(pm.id, 8)
    const yr = await row(pm.id, { name: 'Vuosihinta', gap: '0px 6px', stackWrapEnabled: true })
    await T(yr.id, `tai ${D.PR.y} + alv vuodelta`, TS.body([16, 16, 16], C.paper, 'left', 6), { width: 'fit-content' })
    await T(yr.id, '· kaksi kuukautta kaupan päälle', TS.body([16, 16, 16], C.gLt), { width: 'fit-content' })
    await gap(pm.id, 28)
    await demo(pm.id, 'Pyydä ilmainen demo', 'oranssi')
    await gap(pm.id, 32)
    const tl = await F(pm.id, { name: 'Ehdot', border: { width: '1px 0px 0px 0px', color: C.lineLt, style: 'solid' } })
    for (const [b, s] of D.TERMS) {
      const rw = await row(tl.id, { name: 'Ehto', gap: '14px', stackAlignment: 'start', padding: pad4(12, 0), border: { width: '0px 0px 1px 0px', color: C.lineLt, style: 'solid' } })
      await T(rw.id, b, TS.body([16, 16, 15], C.or, 'left', 7), { width: '92px' })
      await T(rw.id, s, TS.body([16, 16, 15], C.gLt), { width: '1fr' })
    }
    await gap(pm.id, 14)
    const sm = await row(pm.id, { name: 'Pientä', gap: '0px 6px', stackWrapEnabled: true })
    await T(sm.id, 'Palvelu on tarkoitettu yrityksille.', TS.body([14, 14, 14], C.gLt), { width: 'fit-content' })
    await T(sm.id, 'Sopimusehdot', TS.link(C.paper, 14), { width: 'fit-content', link: '/ehdot' })

    const pi = await F(pg.id, { name: 'Sisältyy', padding: pad4(52, 52), borderRadius: '28px', backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' } })
    ov(pi.id, { padding: pad4(36, 36) }, { padding: pad4(28, 24) })
    await T(pi.id, 'Hintaan sisältyy', TS.lab(C.g))
    await gap(pi.id, 14)
    for (const x of D.INCLUDED) {
      const rw = await row(pi.id, { name: 'Sisältyy', gap: '14px', stackAlignment: 'start', padding: pad4(11, 0), border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
      await dotIcon(rw.id, IMG.tick, C.or, 26, 14)
      await T(rw.id, x, TS.body([17, 17, 16], C.ink), { width: '1fr' })
    }
    await gap(pi.id, 28)
    await T(pi.id, 'Ei sisälly', TS.lab(C.g))
    await gap(pi.id, 12)
    for (const x of D.EXCLUDED) {
      const rw = await row(pi.id, { name: 'Ei sisälly', gap: '10px', padding: pad4(6, 0, 6, 4) })
      await F(rw.id, { name: 'Viiva', width: '12px', height: '2px', backgroundColor: C.g, layout: null })
      await T(rw.id, x, TS.body([16, 16, 15], C.g), { width: '1fr' })
    }
    await gap(inner.id, 24)
    const g = await grid(inner.id, [2, 2, 1], '24px', 2)
    const gu = await F(g.id, { name: 'Takuu', backgroundColor: C.or, borderRadius: '24px', padding: pad4(40, 40) }); ov(gu.id, { padding: pad4(28, 28) }, { padding: pad4(24, 24) })
    await pill(gu.id, 'Takuu', C.ink, C.paper); await gap(gu.id, 16)
    await T(gu.id, 'Tarjouspyyntötakuu', TS.d3(C.ink)); await gap(gu.id, 12)
    await T(gu.id, 'Jos sivujen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana, seuraavat kolme kuukautta ovat ilmaisia.', TS.body([17, 17, 16], C.ink), { maxWidth: '520px' })
    const fi = await F(g.id, { name: 'Kolme ensimmäistä', backgroundColor: C.sea, borderRadius: '24px', padding: pad4(40, 40) }); ov(fi.id, { padding: pad4(28, 28) }, { padding: pad4(24, 24) })
    await pill(fi.id, 'Kolme ensimmäistä', C.paper, C.ink); await gap(fi.id, 16)
    await T(fi.id, 'Ensimmäinen kuukausi ilmaiseksi', TS.d3(C.paper)); await gap(fi.id, 12)
    await T(fi.id, 'Kolmelle ensimmäiselle asiakkaalle ensimmäinen kuukausi on ilmainen, kun annat suosittelun ja luvan kertoa projektista sivuillamme.', TS.body([17, 17, 16], C.paper), { maxWidth: '520px' })
  }
  log('pricing')

  // =================== CLIENT ASKS ===================
  {
    const { inner } = await section('Vastaukset')
    const [l, r] = await split(inner.id, ['1.1fr', '0.9fr'])
    await head(l.id, 'd2', 'Asiakkaasi kysyy.', 'Sivut vastaavat.', C.ink, C.sea)
    await T(r.id, 'Nämä asiat asiakas haluaa tietää ennen kuin pyytää tarjouksen. Kun vastaukset löytyvät sivuilta, puhelin soi useammin ja oikeista asioista.', TS.body([20, 19, 18], C.g))
    await gap(inner.id, 48)
    const list = await F(inner.id, { name: 'Kysymykset', border: { width: '2px 0px 0px 0px', color: C.ink, style: 'solid' } })
    for (const [c, q, a] of D.ASKS) {
      const rw = await row(list.id, { name: c, gap: '28px', padding: pad4(22, 0), border: { width: '0px 0px 1px 0px', color: C.line, style: 'solid' } })
      ov(rw.id, { stackDirection: 'vertical', stackAlignment: 'start', gap: '8px' }, { stackDirection: 'vertical', stackAlignment: 'start', gap: '8px' })
      const lc = await T(rw.id, c, TS.lab(C.g), { width: '160px' }); ov(lc.id, { width: '100%' }, { width: '100%' })
      const qc = await T(rw.id, `”${q}”`, TS.serif([30, 26, 22], C.ink), { width: '1.2fr' }); ov(qc.id, { width: '100%' }, { width: '100%' })
      const ac = await row(rw.id, { name: 'Vastaus', width: '1fr', gap: '12px' }); ov(ac.id, { width: '100%' }, { width: '100%' })
      await dotIcon(ac.id, IMG.tick, C.or, 28, 14)
      await T(ac.id, a, TS.body([17, 17, 16], C.g), { width: '1fr' })
    }
  }
  log('asks')

  // =================== WHY ===================
  {
    const { inner } = await section('Miksi')
    await head(inner.id, 'd2', 'Miksi nykyiset sivut eivät tuo töitä.', 'Ja mitä niille tehdään.', C.ink, C.sea, 'left', { maxWidth: '820px' })
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
  log('why')

  // =================== QUOTE + BAND ===================
  {
    const { inner } = await section('Asiakkaan sanoin')
    const q = await hard(inner.id, { dx: 10, dy: 10, color: C.or, radius: 32, name: 'Lainaus' }, { padding: pad4(88, 88), backgroundColor: C.white, border: { width: '2px', color: C.ink, style: 'solid' } })
    ov(q.id, { padding: pad4(56, 48) }, { padding: pad4(36, 24) })
    await T(q.id, 'Asiakkaan sanoin', TS.lab(C.g))
    await gap(q.id, 22)
    await T(q.id, '”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”', st('Quote', { tag: 'p', font: 'serif', size: [56, 44, 30], lh: '1.1em', ls: '-0.02em' }), { maxWidth: '900px' })
    await gap(q.id, 32)
    const fc = await row(q.id, { name: 'Lähde', gap: '14px', width: 'fit-content' })
    await F(fc.id, { name: 'Kuva', width: '52px', height: '52px', borderRadius: '50%', backgroundImage: IMG.valtteri, layout: null })
    const ft = await F(fc.id, { name: 'Nimi', width: 'fit-content' })
    await T(ft.id, 'Valtteri Viitala', TS.body([15, 15, 15], C.ink, 'left', 6), { width: 'fit-content' })
    await T(ft.id, 'Toimitusjohtaja, BuffBird Oy', TS.body([15, 15, 15], C.g), { width: 'fit-content' })
    await gap(inner.id, 64)
    const b = await row(inner.id, { name: 'Työt-kaista', stackDistribution: 'space-between', gap: '20px 32px', stackWrapEnabled: true, padding: pad4(30, 0), border: { width: '1px 0px 1px 0px', color: C.line, style: 'solid' } })
    ov(b.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
    const bt = await T(b.id, 'Katso, miltä tämä näyttää valmiina.', TS.d3(C.ink), { width: 'fit-content' })
    ov(bt.id, null, { width: '100%' })
    await button(b.id, 'Viimeisimmät työt', '/tyot', 'ink')
  }
  log('quote')

  // =================== FAQ ===================
  {
    const { outer, inner } = await section('Kysymykset')
    ANCHOR.kysymykset = outer.id
    const [l, r] = await split(inner.id, ['0.8fr', '1.2fr'], { stackAlignment: 'start', gap: '64px', vgap: '32px' })
    await T(l.id, 'Usein kysyttyä', TS.d2(C.ink))
    await comp(r.id, CODE.ukk, { kysymykset: D.FAQ.map(([kysymys, vastaus]) => ({ kysymys, vastaus })) }, { name: 'Usein kysytyt' })
  }
  log('faq')

  // =================== FOUNDER ===================
  {
    const { inner } = await section('Ville')
    const card = await row(inner.id, { name: 'Perustaja', backgroundColor: C.sand, borderRadius: '32px', padding: pad4(56, 56), gap: '56px' })
    ov(card.id, { padding: pad4(40, 40), gap: '40px' }, { stackDirection: 'vertical', stackAlignment: 'start', padding: pad4(24, 24), gap: '28px' })
    const img = await F(card.id, { name: 'Ville Saarela', width: '300px', aspectRatio: 1, height: null, borderRadius: '24px', backgroundImage: IMG.ville, layout: null })
    ov(img.id, { width: '240px' }, { width: '100%' })
    const tx = await F(card.id, { name: 'Teksti', width: '1fr' }); ov(tx.id, null, { width: '100%' })
    await head(tx.id, 'd2', 'Vielä kysyttävää?', 'Kysy suoraan Villeltä.', C.ink, C.sea)
    await gap(tx.id, 16)
    await T(tx.id, 'Saat vastauksen suoraan Villeltä, Studio Luoton perustajalta, joka perehtyy yritykseesi. Myös julkaisun jälkeen.', TS.body([18, 18, 17], C.g), { maxWidth: '520px' })
    await gap(tx.id, 28)
    const d = await row(tx.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true })
    await button(d.id, 'Soita ' + TEL_H, 'tel:' + TEL, 'or')
    await T(d.id, MAIL, TS.link(C.ink), { width: 'fit-content', link: 'mailto:' + MAIL })
  }
  log('founder')

  // =================== CONTACT (orange) ===================
  {
    const { outer, inner } = await section('Yhteys')
    ANCHOR.yhteys = outer.id
    const card = await F(inner.id, { name: 'Pyydä demo', backgroundColor: C.or, borderRadius: '32px', padding: pad4(120, 80), stackAlignment: 'center' })
    ov(card.id, { padding: pad4(72, 40) }, { padding: pad4(48, 22) })
    await T(card.id, 'Pyydä ilmainen demo.', TS.d1(C.ink, 'center'))
    await gap(card.id, 24)
    await T(card.id, 'Lähetä linkki nykyisiin sivuihisi ja kerro, mitä teette ja missä. Näet uuden etusivusi 48 tunnissa. Maksuton, eikä sido mihinkään.', TS.body([21, 19, 18], C.ink, 'center'), { maxWidth: '560px' })
    await gap(card.id, 36)
    const d = await row(card.id, { name: 'Toiminnot', width: 'fit-content', gap: '16px 28px', stackWrapEnabled: true, stackDistribution: 'center' })
    await demo(d.id, 'Lähetä demopyyntö', 'musta', { tummaVarjo: true })
    await T(d.id, 'tai soita ' + TEL_H, TS.link(C.ink), { width: 'fit-content', link: 'tel:' + TEL })
  }
  log('contact')

  // =================== FOOTER ===================
  {
    await gap(P, 200, 'Väli ennen rantaa')
    const sh = await F(P, { name: 'Ranta', height: '66px', backgroundImage: IMG.shore11, layout: null })
    ov(sh.id, { height: '50px' }, { height: '34px' })
    const { outer, inner } = await band('Alatunniste', { backgroundColor: C.ink, padding: pad4(110, 0, 28, 0) })
    ov(outer.id, { padding: pad4(80, 0, 28, 0) }, { padding: pad4(64, 0, 28, 0) })
    const top = await row(inner.id, { name: 'Ylärivi', stackDistribution: 'space-between', stackAlignment: 'end', gap: '32px', stackWrapEnabled: true })
    ov(top.id, null, { stackDirection: 'vertical', stackAlignment: 'start' })
    const say = await T(top.id, 'Verkkosivut palveluna remontti- ja LVI-yrityksille. Me rakennamme, ylläpidämme ja kehitämme. Sinä keskityt töihin.', st('Footer say', { tag: 'p', font: 'serif', size: [46, 38, 28], lh: '1.1em', ls: '-0.02em', color: C.paper }), { width: '1fr', maxWidth: '780px' })
    ov(say.id, null, { width: '100%' })
    await demo(top.id, 'Pyydä ilmainen demo', 'oranssi')
    await gap(inner.id, 72)
    const g = await grid(inner.id, [3, 3, 1], '28px', 3, { padding: pad4(32, 0, 0, 0), border: { width: '1px 0px 0px 0px', color: C.lineLt, style: 'solid' } })
    const col = async (title, items) => {
      const c = await F(g.id, { name: title, gap: '6px' })
      await T(c.id, title, TS.lab(C.gLt))
      await gap(c.id, 4)
      for (const [t, link] of items) await T(c.id, t, TS.body([15, 15, 15], C.paper), { width: 'fit-content', ...(link ? { link } : {}) })
    }
    await col('Yhteys', [[MAIL, 'mailto:' + MAIL], [TEL_H, 'tel:' + TEL]])
    await col('Sivut', NAV.map(([t, k]) => [t, k.startsWith('/') ? k : null]))
    await col('Studio', [['Isosaarentie 10, 00840 Helsinki', null], ['Tietosuoja', '/tietosuoja'], ['Sopimusehdot', '/ehdot'], ['In English', '/en']])
    await gap(inner.id, 110)
    await F(inner.id, { name: 'Studio Luoto', backgroundImage: IMG.logoW, aspectRatio: 968 / 145, height: null, layout: null })
    await gap(inner.id, 24)
    const bot = await row(inner.id, { name: 'Alarivi', stackDistribution: 'space-between', gap: '8px 24px', stackWrapEnabled: true })
    await T(bot.id, '© 2026 Studio Luoto · Ville Saarela, Y-tunnus 3660060-6', TS.body([13, 13, 13], C.gLt), { width: 'fit-content' })
    await T(bot.id, 'Ylös ↑', TS.body([13, 13, 13], C.gLt), { width: 'fit-content', link: '#' + hero.id })
  }
  log('footer')

  // ---------- section links now that the sections exist ----------
  for (const [n, k] of navNodes) await f.setAttributes(n.id, { link: k.startsWith('/') ? k : '#' + ANCHOR[k] })
  await f.setAttributes(navCta.id, { link: '#' + ANCHOR.yhteys })
  await f.setAttributes(ANCHOR.palveluLink.id, { link: '#' + ANCHOR.yhteys })
  // the header comes last in the tree so it sits on top; it is fixed, so its place in the list does not move it
  await f.setParent(hdr.id, P)

  // ---------- breakpoints, then their overrides ----------
  const tab = await page.addBreakpoint(P, { name: 'Tablet', width: 810 })
  const pho = await page.addBreakpoint(P, { name: 'Phone', width: 390 })
  let miss = 0
  for (const [id, t, p] of OV) {
    for (const [bp, a] of [[tab, t], [pho, p]]) {
      if (!a) continue
      try { await f.setAttributes(bp.id + id, a) } catch (e) { miss++; if (miss < 5) log('override miss', bp.name, id, e.message.slice(0, 80)) }
    }
  }
  log('overrides', OV.length, 'misses', miss, 'page', page.id, 'tablet', tab.id, 'phone', pho.id)
  // remove only the styles no text uses any more
  const used = new Set()
  for (const t of await f.getNodesWithType('TextNode')) if (t.inlineTextStyle) used.add(t.inlineTextStyle.id)
  const mine = new Set([...styleCache.values()].map(s => s.id))
  let removed = 0
  for (const s of await f.getTextStyles()) if (!used.has(s.id) && !mine.has(s.id)) { try { await s.remove(); removed++ } catch (e) {} }
  log('unused styles removed', removed, 'in use', used.size)
} catch (e) {
  console.log('ERR', e.message, (e.stack || '').split('\n').slice(0, 4).join(' | '))
} finally { await f.disconnect() }
