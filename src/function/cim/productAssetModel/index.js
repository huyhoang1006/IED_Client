'use strict'
import {ipcMain} from 'electron'
import {cimFunc} from '../../../function/index.js'

// Lấy productAssetModel theo mrid
export const getProductAssetModelByMrid = () => {
    ipcMain.handle('getProductAssetModelByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.ProductAssetModelFunc.getProductAssetModelById(mrid)
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

// Thêm productAssetModel
export const insertProductAssetModel = () => {
    ipcMain.handle('insertProductAssetModel', async function (event, data) {
        const rs = await cimFunc.ProductAssetModelFunc.insertProductAssetModel(data)
        try {
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

// Xóa productAssetModel theo mrid
export const deleteProductAssetModelByMrid = () => {
    ipcMain.handle('deleteProductAssetModelByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.ProductAssetModelFunc.deleteProductAssetModelById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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

// Cập nhật productAssetModel theo mrid
export const updateProductAssetModelByMrid = () => {
    ipcMain.handle('updateProductAssetModelByMrid', async function (event, mrid, data) {
        try {
            const rs = await cimFunc.ProductAssetModelFunc.updateProductAssetModel(mrid, data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
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

// Active productAssetModel
export const active = () => {
    getProductAssetModelByMrid()
    insertProductAssetModel()
    updateProductAssetModelByMrid()
    deleteProductAssetModelByMrid()
}