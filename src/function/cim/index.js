// Only import existing modules
import * as organisationFunc from './organisation/index.js'
import * as parentOrganizationFunc from './parentOrganization/index.js'
import * as substationFunc from './substation/index.js'
import * as powerSystemResourceFunc from './powerSystemResource/index.js'
import * as bayFunc from './bay/index.js'
import * as voltageLevelFunc from './voltageLevel/index.js'
import * as locationFunc from './location/index.js'
import * as voltageFunc from './voltage/index.js'
import * as personFunc from './person/index.js'
import * as personRoleFunc from './personRole/index.js'
import * as configurationEventFunc from './configurationEvent/index.js'
import * as connectivityNodeContainerFunc from './connectivityNodeContainer/index.js'
import * as equipmentContainerFunc from './equipmentContainer/index.js'
import * as productAssetModelFunc from './productAssetModel/index.js'
import * as analogFunc from './analog/index.js'
import * as stringMeasurementFunc from './stringMeasurement/index.js'
import * as valueToAliasFunc from './valueToAlias/index.js'
import * as valueAliasSetFunc from './valueAliasSet/index.js'
import * as bushingFunc from './bushing/index.js'
import * as assetFunc from './asset/index.js'
import * as positionPointFunc from './positionPoint/index.js'
import * as activityRecordFunc from './activityRecord/index.js'
import * as oldWorkFunc from './oldWork/index.js'
import * as electronicAddressFunc from './electronicAddress/index.js'
import * as telephoneNumberFunc from './telephoneNumber/index.js'
import * as streetAddressFunc from './streetAddress/index.js'
import * as streetDetailFunc from './streetDetail/index.js'
import * as townDetailFunc from './townDetail/index.js'



const identifiedObjectFunc = {}
const psrTypeFunc = {}
const baseVoltageFunc = {}

const ProductAssetModelFunc = {}
const discreteFunc = {}

export {identifiedObjectFunc, substationFunc, electronicAddressFunc, locationFunc,
    personFunc, personRoleFunc, psrTypeFunc, streetAddressFunc, streetDetailFunc,
    townDetailFunc, telephoneNumberFunc, organisationFunc, parentOrganizationFunc,
    activityRecordFunc, configurationEventFunc, positionPointFunc, voltageFunc, baseVoltageFunc,
    bayFunc, voltageLevelFunc, powerSystemResourceFunc, ProductAssetModelFunc,
    oldWorkFunc, assetFunc, analogFunc, stringMeasurementFunc, discreteFunc, valueToAliasFunc, valueAliasSetFunc,
    bushingFunc
}