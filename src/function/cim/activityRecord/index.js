import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

// Thêm activity record trong transaction
export const insertActivityRecordTransaction = async (activityRecord, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Insert identified_object first
            const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(activityRecord, dbsql);
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Insert identified object failed', err: identifiedResult.err });
            }

            // Insert activity_record
            dbsql.run(
                `INSERT INTO activity_record(mrid, type, created_date_time)
                 VALUES (?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    type = excluded.type,
                    created_date_time = excluded.created_date_time`,
                [
                    activityRecord.mrid,
                    activityRecord.type || null,
                    activityRecord.created_date_time || new Date().toISOString()
                ],
                function (err) {
                    if (err) {
                        console.error('Insert activity record failed:', err);
                        console.error('Activity record data:', {
                            mrid: activityRecord.mrid,
                            type: activityRecord.type,
                            created_date_time: activityRecord.created_date_time
                        });
                        return reject({ success: false, err, message: 'Insert activity record failed' });
                    }
                    return resolve({ success: true, data: activityRecord, message: 'Insert activity record completed' });
                }
            );
        } catch (err) {
            console.error('Insert activity record transaction failed:', err);
            return reject({ success: false, err, message: 'Insert activity record transaction failed' });
        }
    });
}

// Lấy activity record theo mrid
export const getActivityRecordById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT ar.*, io.name, io.description, io.alias_name
             FROM activity_record ar
             JOIN identified_object io ON ar.mrid = io.mrid
             WHERE ar.mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) {
                    return reject({ success: false, err, message: 'Get activity record failed' });
                }
                if (!row) {
                    return resolve({ success: false, data: null, message: 'Activity record not found' });
                }
                return resolve({ success: true, data: row, message: 'Get activity record completed' });
            }
        );
    });
}

// Cập nhật activity record trong transaction
export const updateActivityRecordByIdTransaction = async (mrid, activityRecord, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update identified_object first
            const identifiedResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, activityRecord, dbsql);
            if (!identifiedResult.success) {
                return reject({ success: false, message: 'Update identified object failed', err: identifiedResult.err });
            }

            // Update activity_record
            dbsql.run(
                `UPDATE activity_record
                 SET type = ?, created_date_time = ?
                 WHERE mrid = ?`,
                [
                    activityRecord.type || null,
                    activityRecord.created_date_time || new Date().toISOString(),
                    mrid
                ],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Update activity record failed' });
                    }
                    return resolve({ success: true, data: activityRecord, message: 'Update activity record completed' });
                }
            );
        } catch (err) {
            return reject({ success: false, err, message: 'Update activity record transaction failed' });
        }
    });
}

// Xóa activity record trong transaction
export const deleteActivityRecordByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        // Delete activity_record (identified_object will be deleted via cascade if configured)
        dbsql.run("DELETE FROM activity_record WHERE mrid = ?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete activity record failed' });
            }
            // Also delete identified_object
            identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                .then(() => {
                    return resolve({ success: true, message: 'Delete activity record completed' });
                })
                .catch(deleteErr => {
                    return reject({ success: false, err: deleteErr, message: 'Delete activity record failed' });
                });
        });
    });
}

