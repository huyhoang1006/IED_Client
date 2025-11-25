import * as ipcParentOrganization from './parentOrganization/index.js'
import * as ipcSubstationEntity from './substation/index.js'
import * as ipcBayEntity from './bay/index.js'
import * as ipcVoltageLevelEntity from './voltageLevel/index.js'

export const active = () => {
    ipcParentOrganization.active()
    ipcSubstationEntity.active()
    ipcBayEntity.active()
    ipcVoltageLevelEntity.active()
}

export { ipcParentOrganization, ipcSubstationEntity, ipcBayEntity, ipcVoltageLevelEntity }
