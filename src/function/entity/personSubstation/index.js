import db from '../../datacontext/index.js'

// Thêm mới Person-Substation relationship
export const insertPersonSubstation = (personSubstation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO person_substation(mrid, person_id, substation_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                person_id = excluded.person_id,
                substation_id = excluded.substation_id`,
            [
                personSubstation.mrid,
                personSubstation.person_id,
                personSubstation.substation_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert person substation failed' })
                return resolve({ success: true, data: personSubstation, message: 'Insert person substation completed' })
            }
        )
    })
}

// Thêm mới Person-Substation trong transaction
export const insertPersonSubstationTransaction = (personSubstation, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO person_substation(mrid, person_id, substation_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                person_id = excluded.person_id,
                substation_id = excluded.substation_id`,
            [
                personSubstation.mrid,
                personSubstation.person_id,
                personSubstation.substation_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert person substation failed' })
                return resolve({ success: true, data: personSubstation, message: 'Insert person substation completed' })
            }
        )
    })
}

// Lấy Person-Substation theo mrid
export const getPersonSubstationByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM person_substation WHERE mrid = ?", [mrid], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Get person substation failed' })
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'Person substation not found' })
            }
            return resolve({
                success: true,
                data: row,
                message: 'Get person substation completed'
            })
        })
    })
}

// Lấy danh sách Person-Substation theo substation_id
export const getPersonSubstationsBySubstationId = (substationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM person_substation WHERE substation_id = ?", [substationId], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get person substations failed' })
            }
            return resolve({
                success: true,
                data: rows,
                message: 'Get person substations completed'
            })
        })
    })
}

// Lấy danh sách Person-Substation theo person_id
export const getPersonSubstationsByPersonId = (personId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM person_substation WHERE person_id = ?", [personId], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get person substations failed' })
            }
            return resolve({
                success: true,
                data: rows,
                message: 'Get person substations completed'
            })
        })
    })
}

// Cập nhật Person-Substation theo mrid
export const updatePersonSubstationByMrid = (mrid, personSubstation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE person_substation 
             SET person_id = ?, substation_id = ?
             WHERE mrid = ?`,
            [
                personSubstation.person_id,
                personSubstation.substation_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update person substation failed' })
                return resolve({ success: true, data: personSubstation, message: 'Update person substation completed' })
            }
        )
    })
}

// Xóa Person-Substation theo mrid
export const deletePersonSubstationByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM person_substation WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete person substation failed' })
            return resolve({ success: true, message: 'Delete person substation completed' })
        })
    })
}
