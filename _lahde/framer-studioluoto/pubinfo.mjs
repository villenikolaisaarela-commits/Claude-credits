import { open } from './fx.mjs'
const f = await open(); try { console.log(JSON.stringify(await f.getPublishInfo())) } finally { await f.disconnect() }
