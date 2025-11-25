'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "../../../function/index.js"

export const getSubstationByMrid = () => {
    ipcMain.handle('getSubstationByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.substationFunc.getSubstationById(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: "Success",
                    data: { ...rs.data }
                }
            } else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getSubstationsInOrganisationForUser = () => {
    ipcMain.handle('getSubstationsInOrganisationForUser', async function (event, mrid, userId) {
        try {
            const rs = await cimFunc.substationFunc.getSubstationsInOrganisationForUser(mrid, userId)
            if (rs.success === true) {
                const mappedData = rs.data.map(item => ({
                    ...item,
                    mode: 'substation'
                }));
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: mappedData
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "fail",
                    data: rs.data || []
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                data: []
            }
        }
    })
}

export const insertSubstation = () => {
    ipcMain.handle('insertSubstation', async function (event, data) {
        try {
            // Validate input data
            if (!data) {
                return {
                    success: false,
                    message: "Insert substation failed: data is required",
                    error: "Data parameter is null or undefined"
                }
            }
            
            // Handle both formats: direct substation object or entity object with nested substation
            let substationData = data
            if (data.substation && typeof data.substation === 'object') {
                // If data is an entity object, extract the substation part
                substationData = data.substation
            }
            
            if (!substationData.mrid) {
                return {
                    success: false,
                    message: "Insert substation failed: mrid is required",
                    error: "Substation mrid is missing in input data"
                }
            }
            
            const rs = await cimFunc.substationFunc.insertSubstation(substationData)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: { ...rs.data }
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "Insert substation failed",
                    error: JSON.stringify(rs, null, 2)
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
                error: JSON.stringify(error, null, 2)
            }
        }
    })
}

export const updateSubstationByMrid = () => {
    ipcMain.handle('updateSubstationByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.substationFunc.updateSubstationById(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteSubstationByMrid = () => {
    ipcMain.handle('deleteSubstationByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.substationFunc.deleteSubstationById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getSubstationByMrid()
    getSubstationsInOrganisationForUser()
    insertSubstation()
    updateSubstationByMrid()
    deleteSubstationByMrid()
}