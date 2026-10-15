// The four small code components the native page needs. Text in them is plain property fields.
export function fontsCSS(map) {
  return `@font-face{font-family:"Luoto Serif";src:url(${map['/assets/fonts/newsreader-latin.woff2']}) format("woff2");font-weight:200 800;font-display:swap}
@font-face{font-family:"Luoto Sans";src:url(${map['/assets/fonts/archivo-latin.woff2']}) format("woff2");font-weight:300 700;font-display:swap}`
}

const HEAD = `import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
`

export function liukurivi(fonts, icon) {
  return HEAD + `
const FONTS = ${JSON.stringify(fonts)}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Liukurivi(props) {
    const { rivit, kuvake, nopeus } = props
    const row = (hidden) => (
        <ul aria-hidden={hidden || undefined} style={{ display: "flex", flex: "none", margin: 0, padding: 0, listStyle: "none", animation: "luoto-marq " + nopeus + "s linear infinite" }}>
            {rivit.map((t, i) => (
                <li key={i} style={{ display: "flex", flex: "none", alignItems: "center", gap: 12, padding: "0 28px", font: "500 clamp(22px, 2vw, 30px)/1.2 'Luoto Serif', Georgia, serif", color: "#0F0F0E", whiteSpace: "nowrap" }}>
                    {kuvake ? <img src={kuvake} alt="" width={30} height={19} style={{ width: 30, height: "auto" }} /> : null}
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    )
    return (
        <div style={{ width: "100%", display: "flex", overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
            <style>{FONTS + "@keyframes luoto-marq{to{transform:translateX(-100%)}}@media (prefers-reduced-motion: reduce){ul{animation:none!important}}"}</style>
            {row(false)}
            {row(true)}
        </div>
    )
}

Liukurivi.defaultProps = { rivit: ["Kylpyhuoneremontit"], kuvake: ${JSON.stringify(icon)}, nopeus: 48 }

addPropertyControls(Liukurivi, {
    rivit: { type: ControlType.Array, title: "Rivit", control: { type: ControlType.String } },
    kuvake: { type: ControlType.String, title: "Kuvakkeen osoite" },
    nopeus: { type: ControlType.Number, title: "Kierroksen kesto (s)", min: 10, max: 120 },
})
`
}

export function video() {
  return HEAD + `
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Prosessivideo(props) {
    const { webm, mp4, kansikuva, toista, pysayta, kuvaus } = props
    const ref = React.useRef(null)
    const box = React.useRef(null)
    const [playing, setPlaying] = React.useState(false)
    const userPaused = React.useRef(false)
    React.useEffect(() => {
        const v = ref.current
        if (!v || RenderTarget.current() === RenderTarget.canvas) return
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) userPaused.current = true
        const io = new IntersectionObserver((es) => es.forEach((e) => {
            if (e.isIntersecting && !userPaused.current) v.play().catch(() => {})
            else if (!e.isIntersecting) v.pause()
        }), { threshold: 0.35 })
        io.observe(box.current)
        return () => io.disconnect()
    }, [])
    const click = () => {
        const v = ref.current
        if (v.paused) { userPaused.current = false; v.play().catch(() => {}) } else { userPaused.current = true; v.pause() }
    }
    return (
        <div ref={box} style={{ position: "relative", width: "100%", background: "#0F0F0E" }}>
            <video ref={ref} muted loop playsInline preload="none" poster={kansikuva} aria-label={kuvaus}
                onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9" }}>
                <source src={webm} type="video/webm" />
                <source src={mp4} type="video/mp4" />
            </video>
            <button type="button" onClick={click} aria-pressed={!playing}
                style={{ position: "absolute", right: 16, bottom: 16, minHeight: 44, padding: "0 18px", border: 0, borderRadius: 999, background: "rgba(15,15,14,0.7)", color: "#F4F1EA", cursor: "pointer", font: "600 14px/1 'Luoto Sans', Arial, sans-serif" }}>
                {playing ? pysayta : toista}
            </button>
        </div>
    )
}

Prosessivideo.defaultProps = { webm: "", mp4: "", kansikuva: "", toista: "Toista", pysayta: "Pysäytä", kuvaus: "" }

addPropertyControls(Prosessivideo, {
    webm: { type: ControlType.String, title: "Video (webm)" },
    mp4: { type: ControlType.String, title: "Video (mp4)" },
    kansikuva: { type: ControlType.String, title: "Kansikuva" },
    toista: { type: ControlType.String, title: "Toista-teksti" },
    pysayta: { type: ControlType.String, title: "Pysäytä-teksti" },
    kuvaus: { type: ControlType.String, title: "Kuvaus ruudunlukijalle", displayTextArea: true },
})
`
}

export function ukk(fonts) {
  return HEAD + `
const FONTS = ${JSON.stringify(fonts)}
const CSS = FONTS + \`
.ukk{border-top:2px solid #0F0F0E;font-family:"Luoto Sans",Arial,sans-serif;color:#0F0F0E}
.ukk details{border-bottom:1px solid rgba(15,15,14,.14)}
.ukk summary{display:flex;justify-content:space-between;align-items:center;gap:24px;min-height:72px;padding:16px 0;cursor:pointer;list-style:none;font-size:19px;font-weight:500;line-height:1.35}
.ukk summary::-webkit-details-marker{display:none}
.ukk summary i{position:relative;flex:none;width:32px;height:32px;border:2px solid #0F0F0E;border-radius:50%;transition:background-color .3s}
.ukk summary i::before,.ukk summary i::after{content:"";position:absolute;left:8px;right:8px;top:13px;height:2px;background:#0F0F0E}
.ukk summary i::after{transform:rotate(90deg);transition:transform .4s cubic-bezier(.22,1,.36,1)}
.ukk details[open] summary i{background:#FF5B1F}
.ukk details[open] summary i::after{transform:rotate(0)}
.ukk p{max-width:62ch;margin:0;padding:0 0 24px;font-size:17px;line-height:1.55;color:#5C5850}
.ukk summary:focus-visible{outline:3px solid #FF5B1F;outline-offset:3px;border-radius:4px}
\`

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Kysymykset(props) {
    return (
        <div className="ukk" style={{ width: "100%" }}>
            <style>{CSS}</style>
            {props.kysymykset.map((k, i) => (
                <details key={i}>
                    <summary><span>{k.kysymys}</span><i aria-hidden="true" /></summary>
                    <p>{k.vastaus}</p>
                </details>
            ))}
        </div>
    )
}

Kysymykset.defaultProps = { kysymykset: [{ kysymys: "Kysymys", vastaus: "Vastaus" }] }

addPropertyControls(Kysymykset, {
    kysymykset: {
        type: ControlType.Array, title: "Kysymykset",
        control: { type: ControlType.Object, controls: {
            kysymys: { type: ControlType.String, title: "Kysymys" },
            vastaus: { type: ControlType.String, title: "Vastaus", displayTextArea: true },
        } },
    },
})
`
}

export function demonappi(fonts, mail, tel, telH) {
  return HEAD + `
const FONTS = ${JSON.stringify(fonts)}
const MAIL = ${JSON.stringify(mail)}
const ARROW = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
const CSS = FONTS + \`
.dn-b{display:inline-flex;align-items:center;gap:12px;min-height:60px;padding:0 30px;border:0;border-radius:999px;font:600 16px/1 "Luoto Sans",Arial,sans-serif;letter-spacing:.01em;cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s cubic-bezier(.22,1,.36,1)}
.dn-b:hover{transform:translateY(2px)}
.dn-b:active{transform:translateY(5px)}
.dn-or{background:#FF5B1F;color:#0F0F0E;box-shadow:0 5px 0 #B83A0C}
.dn-or:hover{box-shadow:0 3px 0 #B83A0C}
.dn-ink{background:#0F0F0E;color:#F4F1EA;box-shadow:0 5px 0 #FF5B1F}
.dn-ink.dn-dk{box-shadow:0 5px 0 #B83A0C}
.dn-ink:hover{box-shadow:0 3px 0 #FF5B1F}
.dn-b:focus-visible{outline:3px solid #FF5B1F;outline-offset:3px}
.dn-d{width:calc(100% - 32px);max-width:520px;max-height:calc(100dvh - 24px);overflow-y:auto;margin:auto;padding:0;border:2px solid #0F0F0E;border-radius:28px;background:#F4F1EA;color:#0F0F0E;box-shadow:10px 10px 0 #FF5B1F;font:400 17px/1.55 "Luoto Sans",Arial,sans-serif;text-align:left}
.dn-d::backdrop{background:rgba(15,15,14,.62)}
.dn-in{position:relative;padding:clamp(24px,5vw,40px)}
.dn-in h2{margin:0;padding-right:52px;font:500 clamp(26px,2.6vw,40px)/1.1 "Luoto Serif",Georgia,serif;letter-spacing:-.02em}
.dn-in>p{margin:12px 0 0;font-size:16px;color:#5C5850}
.dn-x{position:absolute;top:14px;right:14px;width:44px;height:44px;border:0;border-radius:50%;background:#E8E1D2;cursor:pointer;font:600 20px/1 Arial}
.dn-f{display:grid;gap:14px;margin-top:22px}
.dn-2{display:grid;gap:14px}
@media (min-width:520px){.dn-2{grid-template-columns:1fr 1fr}}
.dn-f label{display:grid;gap:6px;font-size:14px;font-weight:600}
.dn-f input,.dn-f textarea{width:100%;box-sizing:border-box;min-height:48px;padding:10px 14px;border:2px solid #0F0F0E;border-radius:14px;background:#fff;color:#0F0F0E;font:400 16px/1.4 "Luoto Sans",Arial,sans-serif}
.dn-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.dn-st{margin:0;font-size:16px;font-weight:600}
.dn-ok{margin-top:22px;padding:20px 22px;border-radius:18px;background:#0E3B3A;color:#F4F1EA;font-size:17px;font-weight:500}
.dn-s{margin:0;font-size:14px;color:#5C5850}
.dn-s a{color:#0F0F0E}
.dn-tel{margin:18px 0 0;font-size:16px;color:#5C5850}
.dn-tel a{color:#0F0F0E;font-weight:600}
/* Framer sets its own font on buttons and fields; these win over it */
button.dn-b,button.dn-b span{font:600 16px/1 "Luoto Sans",Arial,sans-serif!important;letter-spacing:.01em!important}
.dn-d{font:400 17px/1.55 "Luoto Sans",Arial,sans-serif!important}
.dn-in h2{font:500 clamp(26px,2.6vw,40px)/1.1 "Luoto Serif",Georgia,serif!important;letter-spacing:-.02em!important}
.dn-f label{font:600 14px/1.3 "Luoto Sans",Arial,sans-serif!important}
.dn-f input,.dn-f textarea{font:400 16px/1.4 "Luoto Sans",Arial,sans-serif!important}
.dn-in p,.dn-in a{font-family:"Luoto Sans",Arial,sans-serif!important}
\`

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function DemoNappi(p) {
    const d = React.useRef(null)
    const [state, setState] = React.useState("idle")
    const open = () => { if (d.current && d.current.showModal) d.current.showModal(); else window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(p.otsikko) }
    const submit = async (e) => {
        e.preventDefault()
        const f = e.currentTarget
        const data = new FormData(f)
        data.set("_subject", p.otsikko + (data.get("Yritys") ? ": " + data.get("Yritys") : ""))
        setState("busy")
        try {
            const ac = new AbortController()
            const timer = setTimeout(() => ac.abort(), 20000)
            const r = await fetch("https://formsubmit.co/ajax/" + MAIL, { method: "POST", headers: { Accept: "application/json" }, body: data, signal: ac.signal })
            clearTimeout(timer)
            const j = await r.json()
            if (!r.ok || String(j.success) !== "true") throw new Error(j.message)
            setState("ok")
        } catch (err) { setState("err") }
    }
    const cls = "dn-b " + (p.tyyli === "oranssi" ? "dn-or" : "dn-ink" + (p.tummaVarjo ? " dn-dk" : ""))
    return (
        <>
            <style>{CSS}</style>
            <button type="button" className={cls} onClick={open}><span>{p.teksti}</span>{ARROW}</button>
            <dialog ref={d} className="dn-d" aria-label={p.otsikko} onClick={(e) => { if (e.target === d.current) d.current.close() }}>
                <div className="dn-in">
                    <button type="button" className="dn-x" aria-label={p.sulje} onClick={() => d.current.close()}>×</button>
                    <h2>{p.otsikko}</h2>
                    <p>{p.johdanto}</p>
                    {state === "ok" ? <p className="dn-ok" role="status">{p.kiitos}</p> : (
                        <form className="dn-f" onSubmit={submit}>
                            <div className="dn-2">
                                <label>{p.nimi} *<input name="Nimi" required autoComplete="name" /></label>
                                <label>{p.yritys}<input name="Yritys" autoComplete="organization" /></label>
                            </div>
                            <div className="dn-2">
                                <label>{p.sahkoposti} *<input name="email" type="email" required autoComplete="email" /></label>
                                <label>{p.puhelin}<input name="Puhelin" type="tel" autoComplete="tel" /></label>
                            </div>
                            <label>{p.sivut}<input name="Nykyiset sivut" autoComplete="url" placeholder={p.sivutEsim} /></label>
                            <label>{p.viesti}<textarea name="Viesti" rows={3} /></label>
                            <input type="hidden" name="_template" value="table" />
                            <input type="hidden" name="_captcha" value="false" />
                            <input className="dn-hp" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                            <button type="submit" className="dn-b dn-or" disabled={state === "busy"} style={{ justifySelf: "start" }}><span>{p.laheta}</span>{ARROW}</button>
                            <p className="dn-st" role="status" aria-live="polite">{state === "busy" ? p.lahetetaan : state === "err" ? p.virhe : ""}</p>
                            <p className="dn-s">{p.tietosuojaTeksti} <a href={p.tietosuojaLinkki}>{p.tietosuoja}</a></p>
                        </form>
                    )}
                    <p className="dn-tel">{p.taiSoita} <a href={"tel:" + p.puhelinnumero.replace(/\\s/g, "").replace(/^0/, "+358")}>{p.puhelinnumero}</a></p>
                </div>
            </dialog>
        </>
    )
}

DemoNappi.defaultProps = {
    teksti: "Pyydä ilmainen demo", tyyli: "oranssi", tummaVarjo: false,
    otsikko: "Pyydä ilmainen demo", johdanto: "Näet uuden etusivusi 48 tunnissa. Maksuton, eikä sido mihinkään. Vastaamme yhden arkipäivän sisällä.",
    nimi: "Nimi", yritys: "Yritys", sahkoposti: "Sähköposti", puhelin: "Puhelin", sivut: "Nykyiset sivut", sivutEsim: "www.yrityksesi.fi", viesti: "Mitä teette ja millä alueella?",
    laheta: "Lähetä demopyyntö", lahetetaan: "Lähetetään…", kiitos: "Kiitos! Demopyyntö on lähetetty. Vastaamme yhden arkipäivän sisällä.",
    virhe: "Lähetys ei onnistunut. Lähetä viesti osoitteeseen " + MAIL + " tai soita ${telH}.",
    tietosuojaTeksti: "Käytämme tietoja vain vastataksemme sinulle.", tietosuoja: "Tietosuoja", tietosuojaLinkki: "/tietosuoja",
    taiSoita: "Tai soita", puhelinnumero: ${JSON.stringify(telH)}, sulje: "Sulje",
}

addPropertyControls(DemoNappi, {
    teksti: { type: ControlType.String, title: "Napin teksti" },
    tyyli: { type: ControlType.Enum, title: "Väri", options: ["oranssi", "musta"], optionTitles: ["Oranssi", "Musta"] },
    tummaVarjo: { type: ControlType.Boolean, title: "Tumma varjo (oranssilla pohjalla)" },
    otsikko: { type: ControlType.String, title: "Lomakkeen otsikko" },
    johdanto: { type: ControlType.String, title: "Lomakkeen johdanto", displayTextArea: true },
    nimi: { type: ControlType.String, title: "Kenttä: nimi" },
    yritys: { type: ControlType.String, title: "Kenttä: yritys" },
    sahkoposti: { type: ControlType.String, title: "Kenttä: sähköposti" },
    puhelin: { type: ControlType.String, title: "Kenttä: puhelin" },
    sivut: { type: ControlType.String, title: "Kenttä: nykyiset sivut" },
    sivutEsim: { type: ControlType.String, title: "Esimerkki: sivut" },
    viesti: { type: ControlType.String, title: "Kenttä: viesti" },
    laheta: { type: ControlType.String, title: "Lähetä-nappi" },
    lahetetaan: { type: ControlType.String, title: "Lähetetään-teksti" },
    kiitos: { type: ControlType.String, title: "Kiitosviesti", displayTextArea: true },
    virhe: { type: ControlType.String, title: "Virheviesti", displayTextArea: true },
    tietosuojaTeksti: { type: ControlType.String, title: "Tietosuojateksti" },
    tietosuoja: { type: ControlType.String, title: "Tietosuojalinkin teksti" },
    tietosuojaLinkki: { type: ControlType.String, title: "Tietosuojalinkki" },
    taiSoita: { type: ControlType.String, title: "Tai soita -teksti" },
    puhelinnumero: { type: ControlType.String, title: "Puhelinnumero" },
    sulje: { type: ControlType.String, title: "Sulje (ruudunlukija)" },
})
`
}
