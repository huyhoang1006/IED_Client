import * as locationUploadFunc from './customTemplate/location/location.js'
import * as locationFunc from './cim/location/index.js'
import * as ownerFunc from './organisation/index.js'
import * as cimFunc from './cim/index.js'
import * as userFunc from './transformer/user.js'
import * as entityFunc from './entity/index.js'
import * as attachmentFunc from './attachment/index.js'

const assetFunc = {}
const jobFunc = {}
const importHavec1pha1capFunc = {}
const importHavec3pha1capFunc = {}
const importHavec3pha2capFunc = {}
const uploadFunc = {}
const circuitFunc = {}
const jobAssetFunc = {}
const jobCircuitFunc = {}
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

export { userFunc, locationFunc, assetFunc, jobFunc, importHavec1pha1capFunc, importHavec3pha1capFunc, importHavec3pha2capFunc, uploadFunc, entityFunc}
export {circuitFunc, jobAssetFunc, jobCircuitFunc, attachmentFunc, conditionFunc}
export {currentTransFunc, currentTransJobFunc, voltageTransFunc, voltageTransJobFunc, disconnectorFunc, disconnectorJobFunc}
export {surgeArresterFunc, surgeArresterJobFunc, powerCableFunc, powerCableJobFunc}
export {locationUploadFunc, updateManuFunc, ownerFunc}
export { cimFunc }