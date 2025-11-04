'use strict'
const {ipcRenderer} = require('electron')
export const assetPreload = () => {
    return {
        getSurgeArresterByPsrId : (psrId) => ipcRenderer.invoke('getSurgeArresterByPsrId', psrId),
        getBushingByPsrId : (psrId) => ipcRenderer.invoke('getBushingByPsrId', psrId),
        getAssetByPsrIdAndKind : (psrId, kind) => ipcRenderer.invoke('getAssetByPsrIdAndKind', psrId, kind),
    }
}
