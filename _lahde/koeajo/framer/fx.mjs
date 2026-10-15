import { connect } from 'framer-api'
import fs from 'fs'
export const URL_ = 'https://framer.com/projects/Doventus-testi--ndTQAKfO89t6VmXojqHo-1NwBp'
export async function open() { return connect(URL_, process.env.FRAMER_API_KEY) }
