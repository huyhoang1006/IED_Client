'use strict'
const {ipcRenderer} = require('electron')
export const locationPreload = () => {
    return {
        getLocationByOrganisationId : (organisationId) => ipcRenderer.invoke('getLocationByOrganisationId', organisationId),
        getLocationByMrid : (mrid) => ipcRenderer.invoke('getLocationByMrid', mrid),
        insertLocation : (data) => ipcRenderer.invoke('insertLocation', data),
        updateLocationByMrid : (mrid, data) => ipcRenderer.invoke('updateLocationByMrid', mrid, data),
        deleteLocationByMrid : (mrid) => ipcRenderer.invoke('deleteLocationByMrid', mrid),
    }
}
