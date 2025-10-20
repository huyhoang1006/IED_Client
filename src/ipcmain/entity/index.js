import * as ipcParentOrganization from './parentOrganization/index.js'

export const active = () => {
    ipcParentOrganization.active()
}

export { ipcParentOrganization }
