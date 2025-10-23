import * as ipcParentOrganization from './parentOrganization/index.js'
import * as ipcSubstation from './substation/index.js'
import * as ipcBay from './bay/index.js'
// import * as ipcLocation from './location/index.js' // Module not found
// import * as ipcStreetDetail from './streetDetail/index.js' // Module not found
// import * as ipcTownDetail from './townDetail/index.js' // Module not found
// import * as ipcStreetAddress from './streetAddress/index.js' // Module not found
// import * as ipcPerson from './person/index.js' // Module not found
// import * as ipcPersonRole from './personRole/index.js' // Module not found
// import * as ipcElectronicAddress from './electronicAddress/index.js' // Module not found
// import * as ipcTelephoneNumber from './telephoneNumber/index.js' // Module not found
// import * as ipcConfigurationEvent from './configurationEvent/index.js' // Module not found
// import * as ipcPositionPoint from './positionPoint/index.js' // Module not found
// import * as ipcVoltageLevel from './voltageLevel/index.js' // Module not found
// import * as ipcVoltage from './voltage/index.js' // Module not found
// import * as ipcBaseVoltage from './baseVoltage/index.js' // Module not found
// import * as ipcPowerSystemResource from './powerSystemResource/index.js' // Module not found
// import * as ipcProductAssetModel from './productAssetModel/index.js' // Module not found
// import * as ipcSurgeArrester from './surgeArrester/index.js' // Module not found
// import * as ipcOldWork from './oldWork/index.js' // Module not found
// import * as ipcAsset from './asset/index.js' // Module not found
// import * as ipcAnalog from './analog/index.js' // Module not found
// import * as ipcStringMeasurement from './stringMeasurement/index.js' // Module not found
// import * as ipcDiscrete from './discrete/index.js' // Module not found
// import * as ipcValueToAlias from './valueToAlias/index.js' // Module not found
// import * as ipcValueAliasSet from './valueAliasSet/index.js' // Module not found
// import * as ipcBushing from './bushing/index.js' // Module not found


export const active = () => {
    ipcParentOrganization.active()
    ipcSubstation.active()
    ipcBay.active()
    // ipcLocation.active() // Module not found
    // ipcStreetDetail.active() // Module not found
    // ipcTownDetail.active() // Module not found
    // ipcStreetAddress.active() // Module not found
    // ipcPerson.active() // Module not found
    // ipcPersonRole.active() // Module not found
    // ipcElectronicAddress.active() // Module not found
    // ipcTelephoneNumber.active() // Module not found
    // ipcConfigurationEvent.active() // Module not found
    // ipcPositionPoint.active() // Module not found
    // ipcVoltageLevel.active() // Module not found
    // ipcVoltage.active() // Module not found
    // ipcBaseVoltage.active() // Module not found
    // ipcPowerSystemResource.active() // Module not found
    // ipcSurgeArrester.active() // Module not found
    // ipcProductAssetModel.active() // Module not found
    // ipcOldWork.active() // Module not found
    // ipcAsset.active() // Module not found
    // ipcAnalog.active() // Module not found
    // ipcStringMeasurement.active() // Module not found
    // ipcDiscrete.active() // Module not found
    // ipcValueToAlias.active() // Module not found
    // ipcValueAliasSet.active() // Module not found
    // ipcBushing.active() // Module not found
}