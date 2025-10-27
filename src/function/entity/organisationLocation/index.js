import db from '../../datacontext/index.js'

// Thêm mới Organisation-Location relationship
export const insertOrganisationLocation = (organisationLocation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO organisation_location(mrid, organisation_id, location_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                location_id = excluded.location_id`,
            [
                organisationLocation.mrid,
                organisationLocation.organisation_id,
                organisationLocation.location_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisation location failed' })
                return resolve({ success: true, data: organisationLocation, message: 'Insert organisation location completed' })
            }
        )
    })
}

// Thêm mới Organisation-Location trong transaction
export const insertOrganisationLocationTransaction = (organisationLocation, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO organisation_location(mrid, organisation_id, location_id)
             VALUES (?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                organisation_id = excluded.organisation_id,
                location_id = excluded.location_id`,
            [
                organisationLocation.mrid,
                organisationLocation.organisation_id,
                organisationLocation.location_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert organisation location failed' })
                return resolve({ success: true, data: organisationLocation, message: 'Insert organisation location completed' })
            }
        )
    })
}

// Lấy Organisation-Location theo mrid
export const getOrganisationLocationByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM organisation_location WHERE mrid = ?", [mrid], (err, row) => {
            if (err) {
                return reject({ success: false, err, message: 'Get organisation location failed' })
            }
            if (!row) {
                return resolve({ success: false, data: null, message: 'Organisation location not found' })
            }
            return resolve({
                success: true,
                data: row,
                message: 'Get organisation location completed'
            })
        })
    })
}

// Lấy danh sách Organisation-Location theo organisation_id
export const getOrganisationLocationsByOrganisationId = (organisationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_location WHERE organisation_id = ?", [organisationId], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get organisation locations failed' })
            }
            return resolve({
                success: true,
                data: rows,
                message: 'Get organisation locations completed'
            })
        })
    })
}

// Lấy danh sách Organisation-Location theo location_id
export const getOrganisationLocationsByLocationId = (locationId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM organisation_location WHERE location_id = ?", [locationId], (err, rows) => {
            if (err) {
                return reject({ success: false, err, message: 'Get organisation locations failed' })
            }
            return resolve({
                success: true,
                data: rows,
                message: 'Get organisation locations completed'
            })
        })
    })
}

// Cập nhật Organisation-Location theo mrid
export const updateOrganisationLocationByMrid = (mrid, organisationLocation) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE organisation_location 
             SET organisation_id = ?, location_id = ?
             WHERE mrid = ?`,
            [
                organisationLocation.organisation_id,
                organisationLocation.location_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update organisation location failed' })
                return resolve({ success: true, data: organisationLocation, message: 'Update organisation location completed' })
            }
        )
    })
}

// Xóa Organisation-Location theo mrid
export const deleteOrganisationLocationByMrid = (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM organisation_location WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete organisation location failed' })
            return resolve({ success: true, message: 'Delete organisation location completed' })
        })
    })
}
