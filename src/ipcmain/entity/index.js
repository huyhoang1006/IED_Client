import * as ipcParentOrganization from './parentOrganization/index.js'
import * as ipcSubstationEntity from './substation/index.js'
import * as ipcBayEntity from './bay/index.js'

export const active = () => {
    ipcParentOrganization.active()
    ipcSubstationEntity.active()
    ipcBayEntity.active()
}

export { ipcParentOrganization, ipcSubstationEntity, ipcBayEntity }
