import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

// Get ValueAliasSet by mrid
export const getValueAliasSetByMrid = () => {
    ipcMain.handle('getValueAliasSetByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.valueAliasSetFunc.getValueAliasSetById(mrid)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Get ValueAliasSet and ValueToAlias by mrid
export const getValueAliasSetAndValueToAliasByMrid = () => {
    ipcMain.handle('getValueAliasSetAndValueToAliasByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.valueAliasSetFunc.getValueAliasSetAndValueToAliasById(mrid)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Get ValueAliasSet by mrids
export const getValueAliasSetByMrids = () => {
    ipcMain.handle('getValueAliasSetByMrids', async function (event, mridArray) {
        try {
            const rs = await cimFunc.valueAliasSetFunc.getValueAliasSetByIds(mridArray)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Active ValueAliasSet
export const active = () => {
    getValueAliasSetByMrid()
    getValueAliasSetAndValueToAliasByMrid()
    getValueAliasSetByMrids()
}