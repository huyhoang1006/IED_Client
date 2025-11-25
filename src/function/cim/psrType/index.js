import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Lấy psrType theo mrid
export const getPsrTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        if (!mrid) {
            return resolve({ success: false, data: null, message: 'PsrType mrid is required' })
        }
        
        db.get("SELECT * FROM psr_type WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get psrType by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'PsrType not found' })
            
            // Get additional data from identified_object
            db.get("SELECT * FROM identified_object WHERE mrid=?", [mrid], (ioErr, ioRow) => {
                if (ioErr) {
                    // If identified_object not found, return just psr_type data
                    return resolve({ success: true, data: row, message: 'Get psrType by id completed' })
                }
                
                // Merge identified_object data with psr_type data
                const data = {
                    ...row,
                    name: ioRow?.name || null,
                    description: ioRow?.description || null,
                    alias_name: ioRow?.alias_name || null
                }
                
                return resolve({ success: true, data: data, message: 'Get psrType by id completed' })
            })
        })
    })
}

// Thêm psrType
export const insertPsrType = async (psrType) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            insertPsrTypeTransaction(psrType, db)
                .then(result => {
                    db.run('COMMIT')
                    return resolve(result)
                })
                .catch(err => {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert PsrType transaction failed' })
                })
        })
    })
}

// Thêm psrType transaction
export const insertPsrTypeTransaction = async (psrType, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!psrType || !psrType.mrid) {
            return reject({ success: false, message: 'PsrType mrid is required' })
        }

        // Generate name for identified_object if not provided
        let psrTypeName = psrType.name || ''
        if (!psrTypeName || psrTypeName === '') {
            psrTypeName = psrType.mrid || 'PsrType'
        }

        // Insert identified_object first
        identifiedObjectFunc.insertIdentifiedObjectTransaction({
            mrid: psrType.mrid,
            name: psrTypeName,
            alias_name: psrType.alias_name || null,
            description: psrType.description || null
        }, dbsql)
            .then(identifiedResult => {
                if (!identifiedResult.success) {
                    return reject({ success: false, message: 'Insert identified_object failed', err: identifiedResult.err })
                }

                // Insert into psr_type table (only mrid, other fields are in identified_object)
                dbsql.run(
                    `INSERT INTO psr_type(mrid)
                     VALUES (?)
                     ON CONFLICT(mrid) DO NOTHING`,
                    [psrType.mrid],
                    function (err) {
                        if (err) {
                            return reject({ success: false, err, message: 'Insert PsrType failed' })
                        }
                        return resolve({ success: true, data: psrType, message: 'Insert PsrType completed' })
                    }
                )
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Insert PsrType transaction failed: ' + (err?.message || 'Unknown error') })
            })
    })
}

// Cập nhật psrType theo mrid
export const updatePsrTypeById = async (mrid, psrType) => {
    return new Promise((resolve, reject) => {
        // PsrType table only has mrid, update identified_object instead
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, {
            name: psrType.name || null,
            description: psrType.description || null,
            alias_name: psrType.alias_name || null
        }, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, err: result.err, message: 'Update PsrType failed' })
                }
                return resolve({ success: true, data: psrType, message: 'Update PsrType completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update PsrType failed' })
            })
    })
}

// Cập nhật psrType theo mrid transaction
export const updatePsrTypeByIdTransaction = async (mrid, psrType, dbsql) => {
    return new Promise((resolve, reject) => {
        // PsrType table only has mrid, update identified_object instead
        identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, {
            name: psrType.name || null,
            description: psrType.description || null,
            alias_name: psrType.alias_name || null
        }, dbsql)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, err: result.err, message: 'Update PsrType failed' })
                }
                return resolve({ success: true, data: psrType, message: 'Update PsrType completed' })
            })
            .catch(err => {
                return reject({ success: false, err, message: 'Update PsrType failed' })
            })
    })
}

// Xóa psrType theo mrid
export const deletePsrTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM psr_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete PsrType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'PsrType not found' })
            return resolve({ success: true, data: null, message: 'Delete PsrType completed' })
        })
    })
}

// Xóa psrType theo mrid transaction
export const deletePsrTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM psr_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete PsrType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'PsrType not found' })
            return resolve({ success: true, data: null, message: 'Delete PsrType completed' })
        })
    })
}

