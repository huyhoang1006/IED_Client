import db from '../datacontext/index.js'
import {v4 as newUuid} from 'uuid'

export const getOwnerByName = (name) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM owner where name=?', [name], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const getOwnerByPhone = (phone) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM owner where phone1=? or phone2=?', [phone, phone], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const getOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM owner where id=?', [id], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: `Get owner failed: ${err.message || err}` })
            }
            if (!row) {
                return resolve({ success: false, data: null, message: `Owner with id '${id}' not found` })
            }
            resolve({
                success: true,
                data: row
            })
        })
    })
}

export const getOrganisationById = async (id) => {
    return await getOwnerById(id)
}

export const getOwnerByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM owner where user_id=?', [user_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const getOwnerByRefId = (ref_id) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM owner where ref_id=?', [ref_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success: true,
                data: rows
            })
        })
    })
}

export const insertOwner = (data) => {
    let id = data.id || newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO owner(id, name, user_id, address, city, state, country, phone_no, fax, email, name_person, phone1, phone2, fax_contact, email_contact, department, position, comment, ref_id, mode)' +
        ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id, data.name, data.user_id, data.address, data.city, data.state, data.country, data.phone_no, data.fax, data.email, data.name_person, data.phone1, data.phone2, data.fax_contact, data.email_contact, data.department, data.position, data.comment, data.ref_id, data.mode
        ], function (err) {
            if (err) reject(err)
            resolve({
                id : id,
                success : true
            })
        }) 
    });
}

export const insertOrganisationTransaction = async (owner, dbsql) => {
    return new Promise((resolve, reject) => {
        const dbInstance = dbsql || db
        const id = owner.id || newUuid()
        
        const insertData = [
            id,
            owner.name || null,
            owner.user_id || null,
            owner.address || null,
            owner.city || null,
            owner.state || null,
            owner.country || null,
            owner.phone_no || null,
            owner.mode || null,
            owner.ref_id || null,
            owner.fax || null,
            owner.email || null,
            owner.name_person || null,
            owner.phone1 || null,
            owner.phone2 || null,
            owner.fax_contact || null,
            owner.email_contact || null,
            owner.department || null,
            owner.position || null,
            owner.comment || null
        ]

        dbInstance.run(
            `INSERT INTO owner (
                id, name, user_id, address, city, state, country, phone_no, mode, ref_id, fax, email, name_person, phone1, phone2, fax_contact, email_contact, department, position, comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name, user_id=excluded.user_id, address=excluded.address, city=excluded.city, state=excluded.state, country=excluded.country, phone_no=excluded.phone_no, mode=excluded.mode, ref_id=excluded.ref_id, fax=excluded.fax, email=excluded.email, name_person=excluded.name_person, phone1=excluded.phone1, phone2=excluded.phone2, fax_contact=excluded.fax_contact, email_contact=excluded.email_contact, department=excluded.department, position=excluded.position, comment=excluded.comment`,
            insertData,
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert owner failed' })
                }
                return resolve({ success: true, data: owner, message: 'Insert owner completed' })
            }
        )
    })
}

export const updateOwnerById = (id, data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE owner' +
        ' SET name=?, address=?, city=?, state=?, country=?, phone_no=?, fax=?, email=?, name_person=?, phone1=?, phone2=?, fax_contact=?, email_contact=?, department=?, position=?, comment=?, ref_id=?, mode=?' +
        ' WHERE id = ?',
        [data.name, data.address, data.city, data.state, data.country, data.phone_no, data.fax, data.email, data.name_person, data.phone1, data.phone2, data.fax_contact, data.email_contact, data.department, data.position, data.comment, data.ref_id, data.mode, id], function (err) {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}

export const updateOrganisationByIdTransaction = (id, owner, dbsql) => {
    return new Promise((resolve, reject) => {
        const dbInstance = dbsql || db
        dbInstance.run(
            `UPDATE owner SET
                name = ?, user_id = ?, address = ?, city = ?, state = ?, country = ?, phone_no = ?, mode = ?, ref_id = ?, fax = ?, email = ?, name_person = ?, phone1 = ?, phone2 = ?, fax_contact = ?, email_contact = ?, department = ?, position = ?, comment = ?
            WHERE id = ?`,
            [
                owner.name || null, owner.user_id || null, owner.address || null, owner.city || null, owner.state || null, owner.country || null, owner.phone_no || null, owner.mode || null, owner.ref_id || null, owner.fax || null, owner.email || null, owner.name_person || null, owner.phone1 || null, owner.phone2 || null, owner.fax_contact || null, owner.email_contact || null, owner.department || null, owner.position || null, owner.comment || null,
                id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update owner failed' })
                }
                return resolve({ success: true, data: owner, message: 'Update owner completed' })
            }
        )
    })
}

export const deleteOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        db.all('DELETE FROM owner WHERE id = ?', [id], (err, row) => {
            if (err) reject(err)
            resolve({
                success: true
            })
        })
    })
}
