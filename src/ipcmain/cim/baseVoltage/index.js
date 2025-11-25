'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

// Get BaseVoltage by mrid
export const getBaseVoltageByMrid = () => {
    ipcMain.handle('getBaseVoltageByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.baseVoltageFunc.getBaseVoltageById(mrid)
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

// Insert BaseVoltage
export const insertBaseVoltage = () => {
    ipcMain.handle('insertBaseVoltage', async function (event, data) {
        const rs = await cimFunc.baseVoltageFunc.insertBaseVoltage(data)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Update BaseVoltage by mrid
export const updateBaseVoltageByMrid = () => {
    ipcMain.handle('updateBaseVoltageByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.baseVoltageFunc.updateBaseVoltageById(mrid, data)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Delete BaseVoltage by mrid
export const deleteBaseVoltageByMrid = () => {
    ipcMain.handle('deleteBaseVoltageByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.baseVoltageFunc.deleteBaseVoltageById(mrid)
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
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

// Active BaseVoltage
export const active = () => {
    getBaseVoltageByMrid()
    insertBaseVoltage()
    updateBaseVoltageByMrid()
    deleteBaseVoltageByMrid()
}