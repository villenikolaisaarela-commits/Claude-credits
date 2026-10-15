import { connect } from 'framer-api'
export const URL_ = 'https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj'
export async function open() { return connect(URL_, process.env.FRAMER_API_KEY) }
