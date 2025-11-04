'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "../../../function/index.js"

export const insertSubstationEntity = () => {
    ipcMain.handle('insertSubstationEntity', async function (event, entity) {
        try {
            const rs = await entityFunc.substationEntityFunc.insertSubstationEntity(entity)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Insert substation entity failed",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getSubstationEntityByMrid = () => {
    ipcMain.handle('getSubstationEntityByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.substationEntityFunc.getSubstationEntityByMrid(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Get substation entity failed",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateSubstationEntityByMrid = () => {
    ipcMain.handle('updateSubstationEntityByMrid', async function (event, mrid, entity) {
        try {
            const rs = await entityFunc.substationEntityFunc.updateSubstationEntityByMrid(mrid, entity)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Update substation entity failed",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteSubstationEntityByMrid = () => {
    ipcMain.handle('deleteSubstationEntityByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.substationEntityFunc.deleteSubstationEntityByMrid(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "Delete substation entity failed",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    insertSubstationEntity()
    getSubstationEntityByMrid()
    updateSubstationEntityByMrid()
    deleteSubstationEntityByMrid()
}
