import db from '../../datacontext/index.js'

// Thêm mới User-IdentifiedObject relationship
export const insertUserIdentifiedObject = (userIdentifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO user_identified_object(mrid, user_id, identified_object_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                user_id = excluded.user_id,
                identified_object_id = excluded.identified_object_id`,
            [
                userIdentifiedObject.mrid,
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert user identified object failed' })
                return resolve({ success: true, data: userIdentifiedObject, message: 'Insert user identified object completed' })
            }
        )
    })
}

// Thêm mới User-IdentifiedObject trong transaction
export const insertUserIdentifiedObjectTransaction = (userIdentifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO user_identified_object(mrid, user_id, identified_object_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                user_id = excluded.user_id,
                identified_object_id = excluded.identified_object_id`,
            [
                userIdentifiedObject.mrid,
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert user identified object failed' })
                return resolve({ success: true, data: userIdentifiedObject, message: 'Insert user identified object completed' })
            }
        )
    })
}

// Lấy User-IdentifiedObject theo mrid
export const getUserIdentifiedObjectByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE mrid = ?", [mrid], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Get user identified object failed' })
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'User identified object not found' })
            }
            return resolve({
                success: true,
                data: row,
                message: 'Get user identified object completed'
            })
        })
    })
}

// Lấy User-IdentifiedObject theo user_id và identified_object_id
export const getUserIdentifiedObjectByUserIdAndIdentifiedObjectId = (user_id, identified_object_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE user_id = ? AND identified_object_id = ?", [user_id, identified_object_id], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Get user identified object failed' })
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'User identified object not found' })
            }
            return resolve({
                success: true,
                data: row,
                message: 'Get user identified object completed'
            })
        })
    })
}

// Lấy danh sách User-IdentifiedObject theo user_id
export const getUserIdentifiedObjectsByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user_identified_object WHERE user_id = ?", [user_id], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get user identified objects failed' })
            }
            return resolve({
                success: true,
                data: rows || [],
                message: 'Get user identified objects completed'
            })
        })
    })
}

// Lấy danh sách User-IdentifiedObject theo identified_object_id
export const getUserIdentifiedObjectsByIdentifiedObjectId = (identified_object_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user_identified_object WHERE identified_object_id = ?", [identified_object_id], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get user identified objects failed' })
            }
            return resolve({
                success: true,
                data: rows || [],
                message: 'Get user identified objects completed'
            })
        })
    })
}

// Cập nhật User-IdentifiedObject theo mrid
export const updateUserIdentifiedObjectByMrid = (mrid, userIdentifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE user_identified_object 
             SET user_id = ?, identified_object_id = ?
             WHERE mrid = ?`,
            [
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update user identified object failed' })
                return resolve({ success: true, data: userIdentifiedObject, message: 'Update user identified object completed' })
            }
        )
    })
}

// Xóa User-IdentifiedObject theo mrid
export const deleteUserIdentifiedObjectByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM user_identified_object WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete user identified object failed' })
            return resolve({ success: true, message: 'Delete user identified object completed' })
        })
    })
}
