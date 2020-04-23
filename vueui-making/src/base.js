import { v4 } from  'uuid'

let comCase = str => `-${str}`.replace(/-\w/g, a => a.charAt(1).toUpperCase())
let noop = () => {}
let getUuid = () => v4()

export {
  comCase,
  getUuid,
  noop,
}