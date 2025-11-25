'use strict'
import { ipcRenderer } from 'electron'

export const substationEntityPreload = () => {
    return {
        insertSubstationEntity: (entity) => ipcRenderer.invoke('insertSubstationEntity', entity),
        getSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('getSubstationEntityByMrid', mrid),
        updateSubstationEntityByMrid: (mrid, entity) => ipcRenderer.invoke('updateSubstationEntityByMrid', mrid, entity),
        deleteSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('deleteSubstationEntityByMrid', mrid)
    }
}
