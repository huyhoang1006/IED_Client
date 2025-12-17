import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

// Get ValueToAlias by setId
export const getValueToAliasBySetId = () => {
    ipcMain.handle('getValueToAliasBySetId', async function (event, setId) {
        try {
            const rs = await cimFunc.valueToAliasFunc.getValueToAliasByValueAliasSetId(setId)
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

// Get ValueToAlias by mrid
export const getValueToAliasByMrid = () => {
    ipcMain.handle('getValueToAliasByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.valueToAliasFunc.getValueToAliasById(mrid)
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

// Active ValueToAlias
export const active = () => {
    getValueToAliasBySetId()
    getValueToAliasByMrid()
}