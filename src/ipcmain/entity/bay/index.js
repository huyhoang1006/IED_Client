'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "../../../function/index.js"

export const insertBayEntity = () => {
    ipcMain.handle('insertBayEntity', async function (event, data) {
        try {
            const rs = await entityFunc.bayEntityFunc.insertBayEntity(data)
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
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getBayEntityByMrid = () => {
    ipcMain.handle('getBayEntityByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.bayEntityFunc.getBayEntityByMrid(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.error('Error in getBayEntityByMrid:', error);
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteBayEntityByMrid = () => {
    ipcMain.handle('deleteBayEntityByMrid', async function (event, data) {
        try {
            // Nếu data là string (mrid trực tiếp) hoặc có mrid property, dùng deleteBayEntityByMrid
            // Nếu data là object entity, dùng deleteBayEntityById
            
            let rs;
            if (typeof data === 'string') {
                // data là mrid trực tiếp
                rs = await entityFunc.bayEntityFunc.deleteBayEntityByMrid(data)
            } else if (data?.mrid) {
                // data có mrid property, dùng deleteBayEntityByMrid với mrid
                rs = await entityFunc.bayEntityFunc.deleteBayEntityByMrid(data.mrid)
            } else {
                // data là entity object, dùng deleteBayEntityById
                rs = await entityFunc.bayEntityFunc.deleteBayEntityById(data)
            }
            
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
                }
            }
            else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.error('Error in deleteBayEntityByMrid handler:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const active = () => {
    insertBayEntity()
    getBayEntityByMrid()
    deleteBayEntityByMrid()
}