'use strict'
import { ipcRenderer } from 'electron'
export const parentOrganizationEntityPreload = () => {
    return {
        insertParentOrganizationEntity : (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
        updateParentOrganizationEntity : (data) => ipcRenderer.invoke('updateParentOrganizationEntity', data),
        getOrganisationEntityByMrid : (id) => ipcRenderer.invoke('getOrganisationEntityByMrid', id),
        getParentOrganizationByParentMrid : (mrid) => ipcRenderer.invoke('getParentOrganizationByParentMrid', mrid),
        deleteParentOrganizationEntity : (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data),
        // Legacy alias for older renderer code paths that call the ByMrid variant
        deleteParentOrganizationEntityByMrid : (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data)
    }
}