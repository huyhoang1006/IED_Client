'use strict'
import { ipcMain, shell, dialog, BrowserWindow } from 'electron'
import path from 'path'
import { attachmentFunc } from '../../../function/index.js'
import * as fileFunc from '../../../function/entity/file/index.js'
import * as attachmentContext from '../../../function/attachmentcontext/index.js'
const pathUpload = attachmentContext.getAttachmentDir()
import fs from 'fs'

// Open file
export const openFile = () => {
    ipcMain.handle('openFile', async function (event, path) {
        try {
            await shell.openExternal(path)
            return { success: true }
        } catch (err) {
            return { success: false, message: 'Open file failed', err }
        }
    })
}

// Read file data
export const readFileData = () => {
    ipcMain.handle('readFileData', async function (event, file_Path) {
        try {
            const data = await fs.promises.readFile(path.join(pathUpload, `/${file_Path}`))
            return data
        } catch (err) {
            return { success: false, message: 'Read file failed', err }
        }
    })
}

// Download file data
export const downloadFileData = () => {
    ipcMain.handle('downloadFileData', async function (event, base64, dirFile) {
        try {
            await fs.promises.writeFile(path.join(pathUpload, `/${dirFile}`), base64, { encoding: 'base64' })
            return { success: true }
        } catch (err) {
            return { success: false, message: 'Download file data failed', err }
        }
    })
}

// Download file
export const downloadFile = () => {
    ipcMain.handle('downloadFile', async function (event, path) {
        try {
            const rs = await dialog.showOpenDialog({
                title: 'Select the file to be downloaded',
                buttonLabel: 'Save',
                filters: [],
                properties: ['openDirectory']
            })
            if (!rs.canceled) {
                let nameFile = path.split(/[/\\]/).pop()
                const dest = path.join(rs.filePaths[0], nameFile)
                const message = await fileFunc.downloadFile(path, dest)
                return message
            } else {
                return {
                    success: false,
                    message: 'Download cancelled',
                }
            }
        } catch (err) {
            return { success: false, message: 'Download file failed', err }
        }
    })
}

// Get attachment path
export const getAttachmentpath = () => {
    ipcMain.handle('getAttachmentpath', async function (event) {
        try {
            // Get the BrowserWindow from the event sender
            const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow()
            
            // Define supported file types based on Attachment.vue
            const rs = await dialog.showOpenDialog(win || null, {
                title: 'Select the file to be uploaded',
                buttonLabel: 'Upload',
                filters: [
                    {
                        name: 'All Supported Files',
                        extensions: ['png', 'jpg', 'jpeg', 'm4v', 'avi', 'mpg', 'mp4', 'doc', 'docx', 'xlsx', 'xls', 'csv', 'pptx', 'pdf']
                    },
                    {
                        name: 'Images',
                        extensions: ['png', 'jpg', 'jpeg']
                    },
                    {
                        name: 'Videos',
                        extensions: ['m4v', 'avi', 'mpg', 'mp4']
                    },
                    {
                        name: 'Documents',
                        extensions: ['doc', 'docx', 'pdf']
                    },
                    {
                        name: 'Spreadsheets',
                        extensions: ['xlsx', 'xls', 'csv']
                    },
                    {
                        name: 'Presentations',
                        extensions: ['pptx']
                    },
                    {
                        name: 'All Files',
                        extensions: ['*']
                    }
                ],
                properties: ['openFile']
            })
            
            if (!rs.canceled && rs.filePaths && rs.filePaths.length > 0) {
                // Get first file path from array
                const filePath = rs.filePaths[0]
                // Convert Windows path to Unix format (replace backslashes with forward slashes)
                const unixPath = filePath.replace(/\\/g, '/')
                return {
                    success: true,
                    message: '',
                    path: unixPath
                }
            } else {
                return {
                    success: false,
                    message: rs.canceled ? "File selection cancelled" : "No file selected"
                }
            }
        } catch (err) {
            console.error('Get attachment path error:', err)
            const errorMessage = err?.message || err?.toString() || 'Unknown error'
            return { 
                success: false, 
                message: `Get attachment path failed: ${errorMessage}`,
                err: err 
            }
        }
    })
}

// Insert attachment
export const insertAttachment = () => {
    ipcMain.handle('insertAttachment', async function (event, attachment) {
        try {
            const rs = await attachmentFunc.uploadAttachment(attachment)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Insert attachment failed' }
        }
    })
}

// Delete attachment by id
export const deleteAttachmentById = () => {
    ipcMain.handle('deleteAttachmentById', async function (event, id) {
        try {
            const rs = await attachmentFunc.deleteAttachmentById(id)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Delete attachment failed' }
        }
    })
}

// Update attachment by id
export const updateAttachmentById = () => {
    ipcMain.handle('updateAttachmentById', async function (event, id, attachment) {
        try {
            const rs = await attachmentFunc.updateAttachmentById(id, attachment)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Update attachment failed' }
        }
    })
}

// Get attachment by id
export const getAttachmentById = () => {
    ipcMain.handle('getAttachmentById', async function (event, id) {
        try {
            const rs = await attachmentFunc.getAttachmentById(id)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Get attachment by id failed' }
        }
    })
}

// Get attachment by foreign id and type
export const getAttachmentByIdForeignAndType = () => {
    ipcMain.handle('getAttachmentByIdForeignAndType', async function (event, id_foreign, type) {
        try {
            const rs = await attachmentFunc.getAttachmentByForeignIdAndType(id_foreign, type)
            return rs
        } catch (err) {
            return { success: false, err: err, message: 'Get attachment by foreign id failed' }
        }
    })
}

// Active attachment
export const active = () => {
    openFile()
    readFileData()
    downloadFileData()
    downloadFile()
    getAttachmentpath()
    insertAttachment()
    deleteAttachmentById()
    updateAttachmentById()
    getAttachmentById()
    getAttachmentByIdForeignAndType()
}