'use strict'
import { ipcRenderer } from 'electron'

export const substationEntityPreload = () => {
    return {
        insertSubstationEntity: (entity) => ipcRenderer.invoke('insertSubstation', entity),
        getSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('getSubstationByMrid', mrid),
        updateSubstationEntityByMrid: (mrid, entity) => ipcRenderer.invoke('updateSubstationByMrid', mrid, entity),
        deleteSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('deleteSubstationByMrid', mrid)
    }
}
