'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from "../../../function/index.js"

export const insertParentOrganizationEntity = () => {
    ipcMain.handle('insertParentOrganizationEntity', async function (event, data) {
        const rs = await cimFunc.parentOrganizationFunc.insertParentOrganisation(data)
        try {
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: { ...rs.data }
                }
            }
            else {
                console.log("Function returned failure:", rs)
                return {
                    success: false,
                    message: rs.message || "fail",
                    err: rs.err || null
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

export const getOrganisationEntityByMrid = () => {
    ipcMain.handle('getOrganisationEntityByMrid', async function (event, id) {
        const rs = await cimFunc.parentOrganizationFunc.getParentOrganizationById(id)
        try {
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
                    message: "fail",
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

export const deleteParentOrganizationEntity = () => {
    ipcMain.handle('deleteParentOrganizationEntity', async function (event, data) {
        const rs = await cimFunc.parentOrganizationFunc.deleteParentOrganizationById(data)
        try {
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
                    message: "fail",
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
    insertParentOrganizationEntity()
    getOrganisationEntityByMrid()
    deleteParentOrganizationEntity()
}