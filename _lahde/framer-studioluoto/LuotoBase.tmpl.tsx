import * as React from "react"
import { RenderTarget } from "framer"

// The Studio Luoto stylesheet, scoped under .luoto so it never touches Framer's own interface
export const CSS = __CSS__

function injectCSS() {
    if (typeof document === "undefined" || document.getElementById("luoto-css")) return
    const s = document.createElement("style")
    s.id = "luoto-css"
    s.textContent = CSS
    document.head.appendChild(s)
}

let askBound = false

function bindAsk() {
    // Demo request buttons open the form dialog; a bare mailto does nothing without a mail app
    if (askBound) return
    askBound = true
    document.addEventListener("click", (e) => {
        const d = document.getElementById("ask") as HTMLDialogElement | null
        const t = e.target as HTMLElement
        if (!d || !d.showModal) return
        const a = t.closest('a[href^="mailto:"][href*="subject="]')
        if (a && !d.contains(a)) {
            e.preventDefault()
            d.showModal()
            return
        }
        if (t === d || t.closest("[data-close]")) d.close()
    })
    document.addEventListener("submit", async (e) => {
        const f = e.target as HTMLFormElement
        if (!f.classList || !f.classList.contains("ask-f")) return
        e.preventDefault()
        const st = f.querySelector(".ask-st") as HTMLElement
        const b = f.querySelector("button[type=submit]") as HTMLButtonElement
        const data = new FormData(f)
        if (data.get("Yritys")) data.set("_subject", data.get("_subject") + ": " + data.get("Yritys"))
        b.disabled = true
        st.textContent = f.dataset.busy || ""
        try {
            const ac = new AbortController()
            const timer = setTimeout(() => ac.abort(), 20000)
            const r = await fetch(f.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), { method: "POST", headers: { Accept: "application/json" }, body: data, signal: ac.signal })
            clearTimeout(timer)
            const j = await r.json()
            if (!r.ok || String(j.success) !== "true") throw new Error(j.message || String(r.status))
            const ok = document.createElement("p")
            ok.className = "ask-ok"
            ok.setAttribute("role", "status")
            ok.setAttribute("tabindex", "-1")
            ok.textContent = f.dataset.ok || ""
            f.replaceWith(ok)
            ok.focus()
        } catch (err) {
            st.textContent = f.dataset.err || ""
            b.disabled = false
        }
    })
}

export function useLuoto(ref: React.RefObject<HTMLElement>, html: string) {
    React.useEffect(() => {
        injectCSS()
        const root = ref.current
        if (!root) return
        const onCanvas = RenderTarget.current() === RenderTarget.canvas
        const off: Array<() => void> = []

        // Menu
        const btn = root.querySelector(".nav-btn") as HTMLElement | null
        const menu = root.querySelector("#mvalikko") as HTMLElement | null
        if (btn && menu) {
            const toggle = () => {
                const open = btn.getAttribute("aria-expanded") !== "true"
                btn.setAttribute("aria-expanded", String(open))
                menu.classList.toggle("is-open", open)
            }
            const close = (e: Event) => {
                if ((e.target as HTMLElement).closest("a")) {
                    btn.setAttribute("aria-expanded", "false")
                    menu.classList.remove("is-open")
                }
            }
            btn.addEventListener("click", toggle)
            menu.addEventListener("click", close)
            off.push(() => { btn.removeEventListener("click", toggle); menu.removeEventListener("click", close) })
        }

        // Process film: plays while in view, never for people who asked for less motion
        root.querySelectorAll(".film").forEach((fig) => {
            const v = fig.querySelector("video") as HTMLVideoElement
            const b = fig.querySelector(".film-t") as HTMLElement
            if (!v || !b || onCanvas) return
            let paused = matchMedia("(prefers-reduced-motion: reduce)").matches
            const show = () => { const on = !v.paused; b.textContent = on ? (b.dataset.pause || "Pysäytä") : (b.dataset.play || "Toista"); b.setAttribute("aria-pressed", String(!on)) }
            v.addEventListener("play", show)
            v.addEventListener("pause", show)
            b.addEventListener("click", () => { if (v.paused) { paused = false; v.play().catch(() => {}) } else { paused = true; v.pause() } })
            const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !paused) v.play().catch(() => {}); else if (!e.isIntersecting) v.pause() }), { threshold: 0.35 })
            io.observe(fig)
            off.push(() => io.disconnect())
        })

        // Demo request dialog
        if (!onCanvas && root.querySelector("#ask")) bindAsk()

        // Soft arrival of each block; whatever is already on screen is shown at once
        if (!onCanvas && "IntersectionObserver" in window) {
            const els = Array.from(root.querySelectorAll(".rv"))
            els.forEach((e) => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add("in") })
            root.classList.add("rv-on")
            const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), { rootMargin: "0px 0px -8% 0px" })
            els.forEach((e) => { if (!e.classList.contains("in")) io.observe(e) })
            off.push(() => io.disconnect())
        }
        return () => off.forEach((f) => f())
    }, [html])
}

export function LuotoStyle() {
    return <style id="luoto-css-ssr" dangerouslySetInnerHTML={{ __html: CSS }} />
}

export default function LuotoBase() {
    return <LuotoStyle />
}
