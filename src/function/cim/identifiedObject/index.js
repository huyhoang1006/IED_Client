import db from '../../datacontext/index.js'

export const getIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM identified_object WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get identified object by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: row, message: 'Get identified object by id completed' })
        })
    })
}

export const insertIdentifiedObject = async (identifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [
                identifiedObject.mrid,
                identifiedObject.name,
                identifiedObject.alias_name,
                identifiedObject.description
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' })
            }
        )
    })
}

export const insertIdentifiedObjectTransaction = async (identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        // Extract data from the object
        // Handle different entity structures:
        // 1. Substation: might have identifiedObject.substation as an object
        // 2. VoltageLevel: has identifiedObject.voltageLevel with mrid/name
        // 3. Bay: has identifiedObject.bay with mrid/name (but Bay object is passed directly)
        // 4. Direct object: has mrid/name at root level
        let dataSource = identifiedObject
        
        // Check for nested entity structures
        if (identifiedObject.voltageLevel && typeof identifiedObject.voltageLevel === 'object' && identifiedObject.voltageLevel.mrid) {
            dataSource = identifiedObject.voltageLevel
        } else if (identifiedObject.bay && typeof identifiedObject.bay === 'object' && identifiedObject.bay.mrid) {
            dataSource = identifiedObject.bay
        } else if (identifiedObject.substation && typeof identifiedObject.substation === 'object' && identifiedObject.substation.mrid) {
            dataSource = identifiedObject.substation
        } else {
            dataSource = identifiedObject
        }
        
        const mrid = dataSource.mrid
        const name = dataSource.name
        const alias_name = dataSource.aliasName || dataSource.alias_name
        const description = dataSource.description
        
        if (!mrid) {
            console.error('ERROR: mrid is missing in identifiedObject')
            return reject({ success: false, err: 'mrid is missing', message: 'mrid is required' })
        }
        
        if (!name || name === '') {
            console.error('ERROR: name is missing or empty in identifiedObject, mrid:', mrid)
            return reject({ success: false, err: 'name is missing', message: 'name is required' })
        }
        
        dbsql.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [mrid, name || null, alias_name || null, description || null],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert identified object failed: ' + err.message })
                }
                return resolve({ success: true, data: dataSource, message: 'Insert identified object completed' })
            }
        )
    })
}

export const updateIdentifiedObjectById = async (mrid, identifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE identified_object
             SET name = ?, description = ?, alias_name = ?
             WHERE mrid = ?`,
            [identifiedObject.name, identifiedObject.description, identifiedObject.alias_name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Update identified object completed' })
            }
        )
    })
}

export const updateIdentifiedObjectByIdTransaction = async (mrid, identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE identified_object
             SET name = ?, description = ?, alias_name = ?
             WHERE mrid = ?`,
            [identifiedObject.name, identifiedObject.description, identifiedObject.alias_name, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Update identified object completed' })
            }
        )
    })
}

export const deleteIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}

export const deleteIdentifiedObjectByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}