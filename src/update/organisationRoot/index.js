
import * as parentOrganisationFunc from '../../function/cim/parentOrganization/index.js'
import ParentOrganization from '../../views/Cim/ParentOrganization/index.js'
import db from '../../../electron/db.js'

export const createOrganisationRoot = (dbsql) => {
    return new Promise((resolve, reject) => {
        const parentOrganisation = new ParentOrganization()
        parentOrganisation.mrid = '00000000-0000-0000-0000-000000000000'
        parentOrganisation.name = 'Root'
        // Map mrid to id for owner table
        parentOrganisation.id = parentOrganisation.mrid
        parentOrganisation.mode = 'organisation'
        
        const dbInstance = dbsql || db
        dbInstance.serialize(() => {
            dbInstance.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    return reject({ success: false, err, message: 'Begin transaction failed' })
                }
                
                parentOrganisationFunc.insertParentOrganizationTransaction(parentOrganisation, dbInstance)
                    .then(result => {
                        if (!result.success) {
                            dbInstance.run('ROLLBACK')
                            return reject({ success: false, message: 'Create organisation root failed', err: result.err })
                        }
                        // Commit và đợi commit hoàn thành
                        dbInstance.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                return reject({ success: false, err: commitErr, message: 'Commit failed' })
                            }
                            return resolve({ success: true, data: result.data, message: 'Create organisation root completed' })
                        })
                    })
                    .catch(err => {
                        dbInstance.run('ROLLBACK')
                        return reject({ success: false, err, message: 'Create organisation root transaction failed' })
                    })
            })
        })
    })
}