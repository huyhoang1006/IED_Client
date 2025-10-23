'use strict'
const {ipcRenderer} = require('electron')
export const personPreload = () => {
    return {
        getPersonByOrganisationId : (organisationId) => ipcRenderer.invoke('getPersonByOrganisationId', organisationId),
        getPersonByMrid : (mrid) => ipcRenderer.invoke('getPersonByMrid', mrid),
        insertPerson : (data) => ipcRenderer.invoke('insertPerson', data),
        updatePersonByMrid : (mrid, data) => ipcRenderer.invoke('updatePersonByMrid', mrid, data),
        deletePersonByMrid : (mrid) => ipcRenderer.invoke('deletePersonByMrid', mrid),
    }
}
