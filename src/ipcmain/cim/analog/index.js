'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

// Get Analog by mrid
export const getAnalogByMrid = () => {
    ipcMain.handle('getAnalogByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.analogFunc.getAnalogById(mrid)
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

// Get all Analog by procedure
export const getAllAnalogByProcedure = () => {
    ipcMain.handle('getAllAnalogByProcedure', async function (event, procedureId) {
        try {
            const rs = await cimFunc.analogFunc.getAllAnalogByProcedure(procedureId)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    data: rs.data || [],
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

// Insert Analog
export const insertAnalog = () => {
    ipcMain.handle('insertAnalog', async function (event, data) {
        const rs = await cimFunc.analogFunc.insertAnalog(data)
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

// Delete Analog by mrid
export const deleteAnalogByMrid = () => {
    ipcMain.handle('deleteAnalogByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.analogFunc.deleteAnalogById(mrid)
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

// Active Analog
export const active = () => {
    getAnalogByMrid()
    getAllAnalogByProcedure()
    insertAnalog()
    deleteAnalogByMrid()
}