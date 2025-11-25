import db from '../../datacontext/index.js'

// Lấy identified object theo mrid
export const getIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM identified_object WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get identified object by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: row, message: 'Get identified object by id completed' })
        })
    })
}

// Thêm identified object
export const insertIdentifiedObject = async (identifiedObject) => {
    return new Promise((resolve, reject) => {
        // Normalize values - ensure undefined becomes null
        const normalizeValue = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        const normalizedAliasName = normalizeValue(identifiedObject.alias_name);
        const normalizedDescription = normalizeValue(identifiedObject.description);
        
        db.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = excluded.name,
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [
                identifiedObject.mrid,
                identifiedObject.name || null,
                normalizedAliasName,
                normalizedDescription
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' })
            }
        )
    })
}

// Thêm identified object transaction
export const insertIdentifiedObjectTransaction = async (identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        // Normalize values - ensure undefined becomes null
        const normalizeValue = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        const normalizedAliasName = normalizeValue(identifiedObject.alias_name);
        const normalizedDescription = normalizeValue(identifiedObject.description);
        
        dbsql.run(
            `INSERT INTO identified_object(mrid, name, alias_name, description)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                name = COALESCE(excluded.name, identified_object.name),
                alias_name = excluded.alias_name,
                description = excluded.description`,
            [
                identifiedObject.mrid,
                identifiedObject.name || null,
                normalizedAliasName,
                normalizedDescription
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert identified object failed' });
                }
                
                return resolve({ success: true, data: identifiedObject, message: 'Insert identified object completed' });
            }
        )
    })
}

// Cập nhật identified object theo mrid
export const updateIdentifiedObjectById = async (mrid, identifiedObject) => {
    return new Promise((resolve, reject) => {
        // Normalize values - ensure undefined becomes null
        const normalizeValue = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        const normalizedAliasName = normalizeValue(identifiedObject.alias_name);
        const normalizedDescription = normalizeValue(identifiedObject.description);
        
        db.run(
            `UPDATE identified_object
             SET name = ?, description = ?, alias_name = ?
             WHERE mrid = ?`,
            [identifiedObject.name || null, normalizedDescription, normalizedAliasName, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update identified object failed' })
                return resolve({ success: true, data: identifiedObject, message: 'Update identified object completed' })
            }
        )
    })
}

// Cập nhật identified object theo mrid transaction
export const updateIdentifiedObjectByIdTransaction = async (mrid, identifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!mrid) {
            console.error('updateIdentifiedObjectByIdTransaction: MRID is required')
            return reject({ success: false, err: new Error('MRID is required'), message: 'MRID is required for update' })
        }
        if (!identifiedObject) {
            console.error('updateIdentifiedObjectByIdTransaction: identifiedObject is required')
            return reject({ success: false, err: new Error('Identified object data is required'), message: 'Identified object data is required for update' })
        }
        
        // Lấy dữ liệu hiện tại từ database trước
        dbsql.get("SELECT * FROM identified_object WHERE mrid = ?", [mrid], (getErr, currentData) => {
            if (getErr) {
                console.error('updateIdentifiedObjectByIdTransaction: Get current data failed:', getErr)
                return reject({ success: false, err: getErr, message: 'Get current identified object data failed: ' + (getErr.message || getErr) })
            }
            
            if (!currentData) {
                console.error('updateIdentifiedObjectByIdTransaction: Identified object not found for mrid:', mrid)
                return reject({ success: false, err: new Error('Identified object not found'), message: 'Identified object not found for mrid: ' + mrid })
            }
            
            // Merge dữ liệu cũ với dữ liệu mới - chỉ update các trường có giá trị thực sự
            // Nếu giá trị mới là undefined, null, hoặc empty string, giữ lại giá trị cũ
            const hasValue = (value) => {
                return value !== undefined && value !== null && value !== '';
            };
            
            const mergedData = {
                name: hasValue(identifiedObject.name) ? identifiedObject.name : currentData.name,
                description: hasValue(identifiedObject.description) ? identifiedObject.description : currentData.description,
                alias_name: hasValue(identifiedObject.alias_name) ? identifiedObject.alias_name : currentData.alias_name
            };
            
            // Normalize values - ensure empty strings become null
            const normalizeValue = (value) => {
                if (value === '' || value === null) {
                    return null;
                }
                return value;
            };
            
            const normalizedName = normalizeValue(mergedData.name);
            const normalizedDescription = normalizeValue(mergedData.description);
            const normalizedAliasName = normalizeValue(mergedData.alias_name);
            
            dbsql.run(
                `UPDATE identified_object
                 SET name = ?, description = ?, alias_name = ?
                 WHERE mrid = ?`,
                [normalizedName, normalizedDescription, normalizedAliasName, mrid],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update identified object failed: ' + (err.message || err) })
                    }
                    return resolve({ success: true, data: { ...currentData, ...mergedData }, message: 'Update identified object completed' })
                }
            )
        })
    })
}

// Xóa identified object theo mrid
export const deleteIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Identified object not found' })
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}

// Xóa identified object theo mrid transaction
export const deleteIdentifiedObjectByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM identified_object WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete identified object failed' })
            if (this.changes === 0) {
                return resolve({ success: false, data: null, message: 'Identified object not found' })
            }
            return resolve({ success: true, data: null, message: 'Delete identified object completed' })
        })
    })
}