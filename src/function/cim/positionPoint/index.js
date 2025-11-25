import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Lấy PositionPoint theo mrid
export const getPositionPointById = async (mrid) => {
    try {
        // Lấy thông tin từ bảng identified_object (lớp cha)
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }

        // Lấy thông tin từ bảng position_point (lớp con)
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM position_point WHERE mrid = ?", [mrid], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get position point failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Position point not found' })
                // Gộp dữ liệu cha và con
                const data = { ...identifiedResult.data, ...row }
                return resolve({ success: true, data: data, message: 'Get position point completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get position point failed' }
    }
}

// Lấy danh sách PositionPoint theo location_id
export const getPositionPointByLocationId = async (locationId) => {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT pp.*, io.name AS name, io.description AS description
                FROM position_point pp
                JOIN identified_object io ON pp.mrid = io.mrid
                WHERE pp.location = ?
                ORDER BY pp.sequence_number ASC
            `;
            
            db.all(query, [locationId], (err, rows) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get position points by location failed' })
                }
                return resolve({ success: true, data: rows || [], message: 'Get position points by location completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get position points by location failed' }
    }
}

// Insert PositionPoint
export const insertPositionPoint = async (positionPoint) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.insertIdentifiedObjectTransaction(positionPoint, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `INSERT INTO position_point(
                            mrid,
                            x_position,
                            y_position,
                            z_position,
                            sequence_number,
                            location
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(mrid) DO UPDATE SET
                            x_position = excluded.x_position,
                            y_position = excluded.y_position,
                            z_position = excluded.z_position,
                            sequence_number = excluded.sequence_number,
                            location = excluded.location`,
                        [
                            positionPoint.mrid,
                            positionPoint.xPosition || positionPoint.x_position,
                            positionPoint.yPosition || positionPoint.y_position,
                            positionPoint.zPosition || positionPoint.z_position,
                            positionPoint.sequenceNumber || positionPoint.sequence_number,
                            positionPoint.location
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Insert position point failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: positionPoint, message: 'Insert position point completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert position point transaction failed' })
                })
        })
    })
}

// Insert PositionPoint trong transaction
export const insertPositionPointTransaction = async (positionPoint, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.insertIdentifiedObjectTransaction(positionPoint, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `INSERT INTO position_point(
                        mrid,
                        x_position,
                        y_position,
                        z_position,
                        sequence_number,
                        location
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(mrid) DO UPDATE SET
                        x_position = excluded.x_position,
                        y_position = excluded.y_position,
                        z_position = excluded.z_position,
                        sequence_number = excluded.sequence_number,
                        location = excluded.location`,
                    [
                        positionPoint.mrid,
                        positionPoint.xPosition || positionPoint.x_position,
                        positionPoint.yPosition || positionPoint.y_position,
                        positionPoint.zPosition || positionPoint.z_position,
                        positionPoint.sequenceNumber || positionPoint.sequence_number,
                        positionPoint.location
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert position point failed' })
                        }
                        return resolve({ success: true, data: positionPoint, message: 'Insert position point completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert position point transaction failed' })
            })
    })
}

// Insert mảng PositionPoint trong transaction
export const insertPositionPointArrayTransaction = async (positionPointArray, locationId, dbsql) => {
    try {
        if (!Array.isArray(positionPointArray) || positionPointArray.length === 0) {
            return { success: true, message: 'No position points to insert' }
        }

        const results = []
        for (const positionPoint of positionPointArray) {
            // Đảm bảo location được set
            const pointWithLocation = {
                ...positionPoint,
                location: positionPoint.location || locationId
            }
            
            const result = await insertPositionPointTransaction(pointWithLocation, dbsql)
            if (!result.success) {
                return { success: false, err: result.err, message: `Failed to insert position point: ${result.message}` }
            }
            results.push(result.data)
        }

        return { success: true, data: results, message: 'Insert position point array completed' }
    } catch (err) {
        return { success: false, err, message: 'Insert position point array failed' }
    }
}

// Update PositionPoint theo mrid
export const updatePositionPointById = async (mrid, positionPoint) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, positionPoint, db)
                .then(identifiedResult => {
                    if (!identifiedResult.success) {
                        db.run('ROLLBACK')
                        return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                    }
                    db.run(
                        `UPDATE position_point SET
                            x_position = ?,
                            y_position = ?,
                            z_position = ?,
                            sequence_number = ?,
                            location = ?
                        WHERE mrid = ?`,
                        [
                            positionPoint.xPosition || positionPoint.x_position,
                            positionPoint.yPosition || positionPoint.y_position,
                            positionPoint.zPosition || positionPoint.z_position,
                            positionPoint.sequenceNumber || positionPoint.sequence_number,
                            positionPoint.location,
                            mrid
                        ],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK')
                                return reject({ success: false, err, message: 'Update position point failed' })
                            }
                            db.run('COMMIT')
                            return resolve({ success: true, data: positionPoint, message: 'Update position point completed' })
                        }
                    )
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Update position point transaction failed' })
                })
        })
    })
}

// Update PositionPoint trong transaction
export const updatePositionPointByIdTransaction = async (mrid, positionPoint, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, positionPoint, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err })
                }
                dbsql.run(
                    `UPDATE position_point SET
                        x_position = ?,
                        y_position = ?,
                        z_position = ?,
                        sequence_number = ?,
                        location = ?
                    WHERE mrid = ?`,
                    [
                        positionPoint.xPosition || positionPoint.x_position,
                        positionPoint.yPosition || positionPoint.y_position,
                        positionPoint.zPosition || positionPoint.z_position,
                        positionPoint.sequenceNumber || positionPoint.sequence_number,
                        positionPoint.location,
                        mrid
                    ],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Update position point failed' })
                        }
                        return resolve({ success: true, data: positionPoint, message: 'Update position point completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update position point transaction failed' })
            })
    })
}

// Delete PositionPoint theo mrid
export const deletePositionPointById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete position point (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete position point transaction failed' })
            })
    })
}

// Delete PositionPoint trong transaction
export const deletePositionPointByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete position point (and identified object) completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Delete position point transaction failed' })
            })
    })
}

// Delete tất cả PositionPoint theo location_id
export const deletePositionPointByLocationId = async (locationId) => {
    return new Promise((resolve, reject) => {
        // Lấy tất cả position points của location này
        db.all("SELECT mrid FROM position_point WHERE location = ?", [locationId], async (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get position points failed' })
            }
            
            if (!rows || rows.length === 0) {
                return resolve({ success: true, message: 'No position points to delete' })
            }

            // Xóa từng position point
            const deletePromises = rows.map(row => deletePositionPointById(row.mrid))
            try {
                await Promise.all(deletePromises)
                return resolve({ success: true, message: 'Delete position points by location completed' })
            } catch (error) {
                return reject({ success: false, err: error, message: 'Delete position points failed' })
            }
        })
    })
}

// Delete tất cả PositionPoint theo location_id trong transaction
export const deletePositionPointByLocationIdTransaction = async (locationId, dbsql) => {
    return new Promise((resolve, reject) => {
        // Lấy tất cả position points của location này
        dbsql.all("SELECT mrid FROM position_point WHERE location = ?", [locationId], async (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get position points failed' })
            }
            
            if (!rows || rows.length === 0) {
                return resolve({ success: true, message: 'No position points to delete' })
            }

            // Xóa từng position point
            const deletePromises = rows.map(row => deletePositionPointByIdTransaction(row.mrid, dbsql))
            try {
                await Promise.all(deletePromises)
                return resolve({ success: true, message: 'Delete position points by location completed' })
            } catch (error) {
                return reject({ success: false, err: error, message: 'Delete position points failed' })
            }
        })
    })
}

