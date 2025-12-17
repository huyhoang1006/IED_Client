'use strict'
import {ipcMain} from 'electron'
import {ownerFunc} from "../../function/index.js"
import { conditionFunc, attachmentFunc } from '../../function/index.js'
import * as attachmentContext from '../../function/attachmentcontext/index.js'
import fs from 'fs'
import path from 'path'

const pathUpload = attachmentContext.getAttachmentDir()

// Get Owner by name
export const getOwnerByName = () => {
    ipcMain.handle('getOwnerByName', async function (event, name) {
        try {
            const rs = await ownerFunc.getOwnerByName(name)
            if (rs.success == true && rs.data && rs.data.length > 0) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || `Owner with name '${name}' not found`,
                    data: []
                }
            }
        } catch (err) {
            console.error('getOwnerByName error:', err)
            return {
                success: false,
                message: err.message || err.toString() || "fail",
                data: []
            }
        }
    })
}

// Get Owner by phone
export const getOwnerByPhone = () => {
    ipcMain.handle('getOwnerByPhone', async function (event, phone) {
        const rs = await ownerFunc.getOwnerByPhone(phone)
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
    })
}

// Get Owner by id
export const getOwnerById = () => {
    ipcMain.handle('getOwnerById', async function (event, id) {
        const rs = await ownerFunc.getOwnerById(id)
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
    })
}

// Get Owner by user id
export const getOwnerByUserId = () => {
    ipcMain.handle('getOwnerByUserId', async function (event, user_id) {
        const rs = await ownerFunc.getOwnerByUserId(user_id)
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
    })
}

// Get Owner by ref id
export const getOwnerByRefId = () => {
    ipcMain.handle('getOwnerByRefId', async function (event, id) {
        const rs = await ownerFunc.getOwnerByRefId(id)
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
    })
}

// Insert Owner
export const insertOwner = () => {
    ipcMain.handle('insertOwner', async function (event, data) {
        const rs = await ownerFunc.insertOwner(data)
        if (rs.success == true) {
            return {
                success: true,
                message: "Success",
                data : rs.id
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

// Update Owner by id
export const updateOwnerById = () => {
    ipcMain.handle('updateOwnerById', async function (event, id, data) {
        const rs = await ownerFunc.updateOwnerById(id, data)
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
    })
}

// Delete Owner by id
export const deleteOwnerById = () => {
    ipcMain.handle('deleteOwnerById', async function (event, id) {
        const rs = await ownerFunc.deleteOwnerById(id)
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
    })
}

// Delete Owner by ids
export const deleteOwner = () => {
    ipcMain.handle('deleteOwner', async function (event, ids) {
        try {
            for (const id of ids) {
                await ownerFunc.deleteOwnerById(id)
                
                // Get attachment by foreign id and type
                const atmResult = await attachmentFunc.getAttachmentByForeignIdAndType(id, "owner")
                if (atmResult.success && atmResult.data) {
                    const atm = atmResult.data
                    try {
                        const nameData = JSON.parse(atm.name)
                        if (Array.isArray(nameData)) {
                            for (const e of nameData) {
                                if (e.path) {
                                    const filePath = path.join(pathUpload, `/${e.path}`)
                                    if (fs.existsSync(filePath)) {
                                        fs.unlinkSync(filePath)
                                    }
                                }
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing attachment name:', parseError)
                    }
                    // Delete attachment record
                    await attachmentFunc.deleteAttachmentById(atm.id)
                }
                
                // Get and delete testing condition
                const condi = await conditionFunc.getTestingCondition(id)
                if (condi && condi.length !== 0) {
                    await conditionFunc.deleteTestingCondition(id)
                }
            }
            return {
                success: true,
                message: "",
                data: null
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || error.toString(),
                data: null
            }
        }
    })
}

// Active Owner
export const active = () => {
    getOwnerByRefId()
    getOwnerById()
    getOwnerByName()
    getOwnerByPhone()
    insertOwner()
    updateOwnerById()
    deleteOwnerById()
    getOwnerByUserId()
    deleteOwner()
}