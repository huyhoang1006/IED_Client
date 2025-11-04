import db from '../../datacontext/index.js'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

export const insertVoltage = async (voltage, dbsql) => {
    return new Promise(async (resolve, reject) => {
        if (!voltage || !voltage.mrid) {
            return reject({ success: false, message: 'Voltage mrid is required' })
        }

        try {
            // Generate name for identified_object if not provided
            let voltageName = voltage.name
            if (!voltageName || voltageName === '') {
                if (voltage.value !== null && voltage.value !== undefined) {
                    const multiplierStr = voltage.multiplier || ''
                    const unitStr = voltage.unit || 'V'
                    voltageName = `${voltage.value} ${multiplierStr}${unitStr}`.trim()
                } else {
                    voltageName = voltage.mrid // Fallback to mrid if no value
                }
            }

            // Insert into identified_object first (required for foreign key constraint)
            const identifiedObjectData = {
                mrid: voltage.mrid,
                name: voltageName,
                alias_name: voltage.alias_name || null,
                description: voltage.description || null
            }

            const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(identifiedObjectData, dbsql)
            if (!identifiedResult.success) {
                return reject({ 
                    success: false, 
                    err: identifiedResult.err, 
                    message: 'Insert identified_object failed: ' + (identifiedResult.message || 'Unknown error')
                })
            }

            // Insert into voltage table
            dbsql.run(
                `INSERT INTO voltage(mrid, value, multiplier, unit)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    value = excluded.value,
                    multiplier = excluded.multiplier,
                    unit = excluded.unit`,
                [voltage.mrid, voltage.value || null, voltage.multiplier || null, voltage.unit || null],
                function (err) {
                    if (err) {
                        return reject({ success: false, err, message: 'Insert Voltage failed' })
                    }
                    return resolve({ success: true, data: voltage, message: 'Insert Voltage completed' })
                }
            )
        } catch (err) {
            return reject({ 
                success: false, 
                err: err, 
                message: 'Insert Voltage failed: ' + (err.message || 'Unknown error')
            })
        }
    })
}

export const insertVoltageTransaction = async (voltage, dbsql) => {
    return insertVoltage(voltage, dbsql)
}

