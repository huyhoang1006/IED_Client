import { queryAll, execute } from '../../../electron/db.js'
import { v4 as newUuid } from 'uuid'

export const getOwnerByName = (name) => {
    return new Promise((resolve, reject) => {
        try {
            const rows = queryAll("SELECT * FROM owner where name=?", [name])
            resolve({
                success: true,
                data: rows
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const getOwnerByPhone = (phone) => {
    return new Promise((resolve, reject) => {
        try {
            const rows = queryAll("SELECT * FROM owner where phone1=? or phone2=?", [phone, phone])
            resolve({
                success: true,
                data: rows
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const getOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            const rows = queryAll("SELECT * FROM owner where id=?", [id])
            resolve({
                success: true,
                data: rows
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const getOwnerByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        try {
            const rows = queryAll("SELECT * FROM owner where user_id=?", [user_id])
            resolve({
                success: true,
                data: rows
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const getOwnerByRefId = (ref_id) => {
    return new Promise((resolve, reject) => {
        try {
            const rows = queryAll("SELECT * FROM owner where ref_id=?", [ref_id])
            resolve({
                success: true,
                data: rows
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const insertOwner = (data) => {
    const id = data.id || newUuid()
    return new Promise((resolve, reject) => {
        try {
            execute(
                'INSERT INTO owner(id, name, user_id, address, city, state, country, phone_no, fax, email, name_person, phone1, phone2, fax_contact, email_contact, department, position, comment, ref_id, mode, parent_id)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    id, data.name, 
                        data.user_id, 
                        data.address, 
                        data.city, 
                        data.state, 
                        data.country, 
                        data.phone_no, 
                        data.fax, 
                        data.email, 
                        data.name_person, 
                        data.phone1, 
                        data.phone2, 
                        data.fax_contact, 
                        data.email_contact, 
                        data.department, 
                        data.position, 
                        data.comment, 
                        data.ref_id, 
                        data.mode, 
                        data.parent_id
                ]
            )
            resolve({
                id: id,
                success: true
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const updateOwnerById = (id, data) => {
    return new Promise((resolve, reject) => {
        try {
            execute(
                'UPDATE owner' +
                ' SET name=?, address=?, city=?, state=?, country=?, phone_no=?, fax=?, email=?, name_person=?, phone1=?, phone2=?, fax_contact=?, email_contact=?, department=?, position=?, comment=?, ref_id=?, mode=?' +
                ' WHERE id = ?',
                [data.name, data.address, data.city, data.state, data.country, data.phone_no, data.fax, data.email, data.name_person, data.phone1, data.phone2, data.fax_contact, data.email_contact, data.department, data.position, data.comment, data.ref_id, data.mode, id]
            )
            resolve({
                success: true
            })
        } catch (err) {
            reject(err)
        }
    })
}

export const deleteOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            execute("DELETE FROM owner WHERE id = ?", [id])
            resolve({
                success: true
            })
        } catch (err) {
            reject(err)
        }
    })
}