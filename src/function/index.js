// Only import existing modules that work in Node.js/Electron main process
// import * as uploadFunc from './customTemplate/upload.js' // Has missing dependencies, commented out
import * as locationUploadFunc from './customTemplate/location/location.js'
import * as ownerFunc from './organisation/index.js'
import * as cimFunc from './cim/index.js'
import * as userFunc from './entity/user/index.js'

// Placeholder exports for missing modules (to prevent import errors)
// TODO: Implement these modules or remove unused imports
const locationFunc = {}
const assetFunc = {}
const jobFunc = {}
const importHavec1pha1capFunc = {}
const importHavec3pha1capFunc = {}
const importHavec3pha2capFunc = {}
const uploadFunc = {} // Placeholder - actual module has missing dependencies
const circuitFunc = {}
const jobAssetFunc = {}
const jobCircuitFunc = {}
const attachmentFunc = {}
const conditionFunc = {}
const currentTransFunc = {}
const currentTransJobFunc = {}
const voltageTransFunc = {}
const voltageTransJobFunc = {}
const disconnectorFunc = {}
const disconnectorJobFunc = {}
const surgeArresterFunc = {}
const surgeArresterJobFunc = {}
const powerCableFunc = {}
const powerCableJobFunc = {}
const updateManuFunc = {}

export { userFunc, locationFunc, assetFunc, jobFunc, importHavec1pha1capFunc, importHavec3pha1capFunc, importHavec3pha2capFunc, uploadFunc}
export {circuitFunc, jobAssetFunc, jobCircuitFunc, attachmentFunc, conditionFunc}
export {currentTransFunc, currentTransJobFunc, voltageTransFunc, voltageTransJobFunc, disconnectorFunc, disconnectorJobFunc}
export {surgeArresterFunc, surgeArresterJobFunc, powerCableFunc, powerCableJobFunc}
export {locationUploadFunc, updateManuFunc, ownerFunc}
export { cimFunc }