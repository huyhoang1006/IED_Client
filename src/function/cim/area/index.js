import db from '../../datacontext/index.js'

// Lấy area theo mrid
export const getAreaById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM area WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get area by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Area not found' })
            return resolve({ success: true, data: row, message: 'Get area by id completed' })
        })
    })
}

// Lấy tất cả area theo mrids
export const getAreaByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM area WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get area by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Area not found' })
                }
                return resolve({ success: true, data: rows, message: 'Get area by ids completed' })
            }
        )
    })
}

// Thêm area
export const insertArea = async (area) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO area(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                area.mrid,
                area.multiplier,
                area.unit,
                area.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert area failed' })
                return resolve({ success: true, data: area, message: 'Insert area completed' })
            }
        )
    })
}

// Thêm area transaction
export const insertAreaTransaction = async (area, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO area(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                area.mrid,
                area.multiplier,
                area.unit,
                area.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert area failed' })
                return resolve({ success: true, data: area, message: 'Insert area completed' })
            }
        )
    })
}

// Cập nhật area theo mrid
export const updateAreaById = async (mrid, area) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE area
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [area.multiplier, area.unit, area.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update area failed' })
                return resolve({ success: true, data: area, message: 'Update area completed' })
            }
        )
    })
}

// Cập nhật area theo mrid transaction
export const updateLengthByIdTransaction = async (mrid, length, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE length
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [length.multiplier, length.unit, length.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update length failed' })
                return resolve({ success: true, data: length, message: 'Update length completed' })
            }
        )
    })
}

// Xóa area theo mrid
export const deleteLengthById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM length WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete length failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Length not found' })
            return resolve({ success: true, data: null, message: 'Delete length completed' })
        })
    })
}

// Xóa area theo mrid transaction
export const deleteAreaByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM area WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete area failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Area not found' })
            return resolve({ success: true, data: null, message: 'Delete area completed' })
        })
    })
}