'use strict'
import {ipcMain} from 'electron'
import {cimFunc, entityFunc} from '../../../function/index.js'

export const getVoltageByMrid = () => {
    ipcMain.handle('getVoltageLevelByMrid', async function (event, mrid) {
        try {
            if (!mrid) {
                return {
                    success: false,
                    message: 'mrid is required',
                    error: null
                }
            }
            const rs = await entityFunc.voltageLevelEntityFunc.getVoltageLevelEntity(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Error retrieving voltage level entity",
                    error: rs.error || null
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

export const insertVoltage = () => {
    ipcMain.handle('insertVoltage', async function (event, data) {
        const rs = await cimFunc.voltageFunc.insertVoltage(data)
        try {
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

export const insertVoltageLevelEntity = () => {
    ipcMain.handle('insertVoltageLevelEntity', async function (event, data) {
        try {
            const rs = await entityFunc.voltageLevelEntityFunc.insertVoltageLevelEntity(data)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                // Extract full error message from response
                let errorMessage = rs.message || "fail"
                
                // Try to get SQL error message from error object
                if (rs.error) {
                    const sqlErrorMsg = rs.error.errMessage || rs.error.message || ''
                    if (sqlErrorMsg && !errorMessage.includes(sqlErrorMsg)) {
                        errorMessage = errorMessage + ': ' + sqlErrorMsg
                    }
                }
                
                return {
                    success: false,
                    message: errorMessage
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


export const updateVoltageByMrid = () => {
    ipcMain.handle('updateVoltageLevelByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.voltageLevelFunc.updateVoltageLevelById(mrid, data)
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
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteVoltageByMrid = () => {
    ipcMain.handle('deleteVoltageLevelByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.voltageLevelFunc.deleteVoltageLevelById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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

export const getVoltageLevelBySubstationId = () => {
    ipcMain.handle('getVoltageLevelBySubstationId', async function (event, substationId) {
        try {
            const rs = await cimFunc.voltageLevelFunc.getVoltageLevelsBySubstationId(substationId)
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

export const active = () => {
    getVoltageByMrid()
    insertVoltage()
    insertVoltageLevelEntity()
    updateVoltageByMrid()
    deleteVoltageByMrid()
    getVoltageLevelBySubstationId()
}

