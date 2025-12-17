'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

export const getOldWorkByMrid = () => {
    ipcMain.handle('getOldWorkByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.oldWorkFunc.getOldWorkById(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getOldWorkByAssetId = () => {
    ipcMain.handle('getOldWorkByAssetId', async function (event, assetId) {
        try {
            if (!cimFunc.oldWorkFunc || !cimFunc.oldWorkFunc.getOldWorkByAssetId) {
                console.error('getOldWorkByAssetId function not found in cimFunc.oldWorkFunc')
                return {
                    success: false,
                    message: 'getOldWorkByAssetId function is not available',
                }
            }
            const rs = await cimFunc.oldWorkFunc.getOldWorkByAssetId(assetId)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.error('Error in getOldWorkByAssetId handler:', error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getOldWorkByMrid()
    getOldWorkByAssetId()
}