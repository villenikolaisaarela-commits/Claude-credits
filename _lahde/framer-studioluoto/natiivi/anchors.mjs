// Gives the front pages' sections the ids their links point to, so "Palvelu", "Hinnat" and the rest scroll to the right place.
// Framer does not mark a section as a link target when the link is made through the API, so a small script does it on the site.
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const NAMES = ['Alku', 'Palvelu', 'Prosessi', 'Hinnat', 'Kysymykset', 'Yhteys']
try {
  const pages = await f.getNodesWithType('WebPageNode')
  const M = {}
  for (const page of pages) {
    const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
    if (!desk) continue
    const m = {}
    for (const c of await f.getChildren(desk.id)) if (NAMES.includes(c.name)) m[c.name] = c.id
    if (Object.keys(m).length) M[page.path] = m
  }
  const js = `<script>(function(){var M=${JSON.stringify(M)};
function tag(){var p=location.pathname.replace(/\\/$/,'')||'/';var m=M[p];if(!m)return;for(var n in m){if(document.getElementById(m[n]))continue;var els=document.querySelectorAll('[data-framer-name="'+n+'"]');for(var i=0;i<els.length;i++){var e=els[i];if(e.tagName==='A'||e.closest('a')||!e.getClientRects().length)continue;e.id=m[n];break}}}
tag();new MutationObserver(tag).observe(document.documentElement,{childList:true,subtree:true});
if(location.hash){var h=location.hash.slice(1);var k=0,t=setInterval(function(){var e=document.getElementById(h);if(e){e.scrollIntoView();clearInterval(t)}if(++k>40)clearInterval(t)},100)}})();</script>`
  const cc = await f.getCustomCode()
  const prev = (cc.bodyEnd && cc.bodyEnd.html) || ''
  const html = prev.replace(/<script>\(function\(\)\{var M=\{"\/[^]*?<\/script>/, '').trim()
  await f.setCustomCode({ html: (html ? html + '\n' : '') + js, location: 'bodyEnd' })
  console.log('pages with sections', Object.keys(M).join(' '), 'bytes', js.length)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
