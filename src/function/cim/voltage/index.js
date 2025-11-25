import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Helper function: Convert enum number (3, -3) to string ('k', 'm') for database storage
function convertEnumToMultiplierString(multiplier) {
    if (multiplier === null || multiplier === undefined) return null
    // If already a string, return as is
    if (typeof multiplier === 'string') return multiplier
    // Convert number to string
    const numValue = Number(multiplier)
    if (numValue === 3) return 'k'  // kilo
    if (numValue === -3) return 'm'  // milli
    if (numValue === 6) return 'M'  // mega
    if (numValue === 9) return 'G'  // giga
    if (numValue === 12) return 'T'  // tera
    if (numValue === -6) return 'µ'  // micro
    if (numValue === -9) return 'n'  // nano
    if (numValue === -12) return 'p'  // pico
    if (numValue === 0) return null  // none
    // Fallback: return as string
    return multiplier.toString()
}

// Helper function: Convert string ('k', 'm') from database to enum number (3, -3) for frontend
function convertMultiplierStringToEnum(multiplier) {
    if (multiplier === null || multiplier === undefined) return null
    // If already a number, return as is
    if (typeof multiplier === 'number') return multiplier
    // Convert string to number enum
    const strValue = String(multiplier).toLowerCase()
    if (strValue === 'k') return 3  // kilo
    if (strValue === 'm') return -3  // milli
    if (strValue === 'mega' || strValue === 'M') return 6  // mega
    if (strValue === 'g') return 9  // giga
    if (strValue === 't') return 12  // tera
    if (strValue === 'µ' || strValue === 'micro') return -6  // micro
    if (strValue === 'n') return -9  // nano
    if (strValue === 'p') return -12  // pico
    // Try to parse as number
    const numValue = Number(multiplier)
    if (!isNaN(numValue)) return numValue
    // Fallback: return null
    return null
}

export const getVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM voltage WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get voltage by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Voltage not found' })
            // Convert multiplier from string to enum for frontend
            const result = {
                ...row,
                multiplier: convertMultiplierStringToEnum(row.multiplier)
            }
            return resolve({ success: true, data: result, message: 'Get voltage by id completed' })
        })
    })
}

export const getVoltageByIds = async (mrids) => {
    return new Promise((resolve, reject) => {
        if (!mrids || mrids.length === 0) {
            return resolve({ success: false, data: [], message: 'No mrids provided' })
        }

        // Tạo chuỗi placeholder (?, ?, ?) tùy theo số lượng mrid
        const placeholders = mrids.map(() => '?').join(',')

        db.all(
            `SELECT * FROM voltage WHERE mrid IN (${placeholders})`,
            mrids,
            (err, rows) => {
                if (err) {
                    return reject({ success: false, err: err, message: 'Get voltages by ids failed' })
                }
                if (!rows || rows.length === 0) {
                    return resolve({ success: false, data: [], message: 'Voltages not found' })
                }
                // Convert multipliers from string to enum for frontend
                const results = rows.map(row => ({
                    ...row,
                    multiplier: convertMultiplierStringToEnum(row.multiplier)
                }))
                return resolve({ success: true, data: results, message: 'Get voltages by ids completed' })
            }
        )
    })
}


export const insertVoltage = async (voltage) => {
    return new Promise((resolve, reject) => {
        // Convert multiplier from enum to string for database storage
        const multiplierStr = convertEnumToMultiplierString(voltage.multiplier)
        
        db.run(
            `INSERT INTO voltage(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                voltage.mrid,
                multiplierStr,
                voltage.unit,
                voltage.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Insert voltage completed' })
            }
        )
    })
}

export const insertVoltageTransaction = async (voltage, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!voltage || !voltage.mrid) {
            return reject({ success: false, message: 'Voltage mrid is required' })
        }

        // Convert multiplier from enum to string for database storage
        const multiplierStr = convertEnumToMultiplierString(voltage.multiplier)
        
        // Generate name for identified_object if not provided
        let voltageName = voltage.name || ''
        if (!voltageName || voltageName === '') {
            if (voltage.value !== null && voltage.value !== undefined) {
                const unitStr = voltage.unit || 'V'
                voltageName = `${voltage.value} ${multiplierStr || ''}${unitStr}`.trim()
                if (!voltageName || voltageName === '') {
                    voltageName = `${voltage.value} ${unitStr}`.trim()
                }
            } else {
                voltageName = voltage.mrid
            }
        }
        if (!voltageName || voltageName === '') {
            voltageName = voltage.mrid || 'Voltage'
        }

        const identifiedObjectData = {
            mrid: voltage.mrid,
            name: voltageName,
            alias_name: voltage.alias_name || null,
            description: voltage.description || null
        }

        // Insert identified_object first - use direct SQL to ensure it completes before voltage insert
        
        // Ensure name is not null or empty for ON CONFLICT update
        if (!voltageName || voltageName === '') {
            voltageName = voltage.mrid || 'Voltage'
        }
        
        // Use serialize to ensure sequential execution
        dbsql.serialize(() => {
            // Step 1: Insert identified_object
            dbsql.run(
                `INSERT INTO identified_object(mrid, name, alias_name, description)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    name = COALESCE(excluded.name, identified_object.name),
                    alias_name = excluded.alias_name,
                    description = excluded.description`,
                [voltage.mrid, voltageName, voltage.alias_name || null, voltage.description || null],
                function (identifiedErr) {
                    if (identifiedErr) {
                        return reject({ 
                            success: false, 
                            err: identifiedErr, 
                            message: `Insert identified_object failed: ${identifiedErr.message}. mrid: ${voltage.mrid}, name: ${voltageName}`
                        })
                    }

                    // Step 2: Verify identified_object exists in same transaction
                    dbsql.get('SELECT mrid, name FROM identified_object WHERE mrid = ?', [voltage.mrid], (verifyErr, verifyRow) => {
                        if (verifyErr) {
                            return reject({ 
                                success: false, 
                                err: verifyErr, 
                                message: `Insert Voltage failed: Cannot verify identified_object exists - ${verifyErr.message}. mrid: ${voltage.mrid}`
                            })
                        }
                        if (!verifyRow) {
                            return reject({ 
                                success: false, 
                                err: { message: 'identified_object not found after insert' }, 
                                message: `Insert Voltage failed: identified_object with mrid '${voltage.mrid}' was not found after insert. Name: '${voltageName}'. This is required for voltage foreign key constraint.`
                            })
                        }

                        // Step 3: Insert into voltage table (only after verified)
                        // Convert multiplier from enum to string for database storage
                        const multiplierStr = convertEnumToMultiplierString(voltage.multiplier)
                        
                        dbsql.run(
                            `INSERT INTO voltage(mrid, multiplier, unit, value)
                             VALUES (?, ?, ?, ?)
                             ON CONFLICT(mrid) DO UPDATE SET
                                multiplier = excluded.multiplier,
                                unit = excluded.unit,
                                value = excluded.value`,
                            [
                                voltage.mrid,
                                multiplierStr,
                                voltage.unit || null,
                                voltage.value || null
                            ],
                            function (err) {
                                if (err) {
                                    if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY')) {
                                    // Check foreign keys status and schema
                                    dbsql.get('PRAGMA foreign_keys', (fkErr, fkRow) => {
                                        if (fkErr) {
                                            // Error checking foreign keys
                                        } else {
                                            // Foreign keys status checked
                                        }
                                        
                                        // Check voltage table foreign keys
                                        dbsql.all("PRAGMA foreign_key_list(voltage)", (fkListErr, fkList) => {
                                            if (fkListErr) {
                                                // Error getting foreign key list
                                            } else {
                                                // Foreign key list retrieved
                                            }
                                            
                                            // Double check identified_object exists
                                            dbsql.get('SELECT mrid, name FROM identified_object WHERE mrid = ?', [voltage.mrid], (checkErr, checkRow) => {
                                                if (checkErr) {
                                                    return reject({ 
                                                        success: false, 
                                                        err: err, 
                                                        message: `Insert Voltage failed: FOREIGN KEY constraint failed. Cannot verify identified_object - ${checkErr.message}. mrid: '${voltage.mrid}', name: '${voltageName}'. Error: ${err.message}`
                                                    })
                                                }
                                                if (!checkRow) {
                                                    return reject({ 
                                                        success: false, 
                                                        err: err, 
                                                        message: `Insert Voltage failed: FOREIGN KEY constraint failed. identified_object with mrid '${voltage.mrid}' does not exist. Name: '${voltageName}'. This is required for voltage foreign key constraint. Error: ${err.message}`
                                                    })
                                                }
                                                return reject({ 
                                                    success: false, 
                                                    err: err, 
                                                    message: `Insert Voltage failed: FOREIGN KEY constraint failed. mrid: '${voltage.mrid}', name: '${voltageName}'. identified_object exists (name: '${checkRow.name}') but constraint still failed. This may indicate a database schema issue or transaction isolation problem. Error: ${err.message}`
                                                })
                                            })
                                        })
                                    })
                                    return
                                }
                                    return reject({ 
                                        success: false, 
                                        err: err, 
                                        message: `Insert Voltage failed: ${err.message || 'Unknown error'}. mrid: ${voltage.mrid}`
                                    })
                                }
                                return resolve({ success: true, data: voltage, message: 'Insert voltage completed' })
                            }
                        )
                    })
                }
            )
        })
    })
}

export const updateVoltageById = async (mrid, voltage) => {
    return new Promise((resolve, reject) => {
        // Convert multiplier from enum to string for database storage
        const multiplierStr = convertEnumToMultiplierString(voltage.multiplier)
        
        db.run(
            `UPDATE voltage
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [multiplierStr, voltage.unit, voltage.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Update voltage completed' })
            }
        )
    })
}

export const updateVoltageByIdTransaction = async (mrid, voltage, dbsql) => {
    return new Promise((resolve, reject) => {
        // Convert multiplier from enum to string for database storage
        const multiplierStr = convertEnumToMultiplierString(voltage.multiplier)
        
        dbsql.run(
            `UPDATE voltage
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [multiplierStr, voltage.unit, voltage.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update voltage failed' })
                return resolve({ success: true, data: voltage, message: 'Update voltage completed' })
            }
        )
    })
}

export const deleteVoltageById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM voltage WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage completed' })
        })
    })
}

export const deleteVoltageByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM voltage WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete voltage failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Voltage not found' })
            return resolve({ success: true, data: null, message: 'Delete voltage completed' })
        })
    })
}