import db from '../../datacontext/index.js'
import { insertVoltageLevelTransaction, getVoltageLevelById, deleteVoltageLevelByIdTransaction } from '../../cim/voltageLevel/index.js';
export const insertVoltageLevelEntity = async (entity) => {
    try {
        if(entity.voltageLevel && entity.voltageLevel.mrid) {
            if(!entity.voltageLevel.name || entity.voltageLevel.name === '') {
                return { success: false, message: 'Error inserting voltage entity, name is required'};
            }
            await runAsync('BEGIN TRANSACTION');
            try {
                await insertVoltageLevelTransaction(entity.voltageLevel, db);
                await runAsync('COMMIT');
                return { success: true, data: entity, message: 'Voltage level entity inserted successfully' };
            } catch (insertError) {
                try {
                    await runAsync('ROLLBACK');
                } catch (rollbackErr) {
                }

                let sqlErrorMessage = ''
                if (insertError?.err?.message) {
                    sqlErrorMessage = insertError.err.message
                } else if (insertError?.message) {
                    sqlErrorMessage = insertError.message
                } else if (typeof insertError === 'string') {
                    sqlErrorMessage = insertError
                } else if (insertError?.toString) {
                    sqlErrorMessage = insertError.toString()
                } else {
                    sqlErrorMessage = 'Unknown error'
                }
                
                return { 
                    success: false, 
                    error: {
                        message: insertError?.message || sqlErrorMessage,
                        errMessage: insertError?.err?.message || sqlErrorMessage,
                        errCode: insertError?.err?.code
                    }, 
                    message: 'Error inserting voltage entity: ' + sqlErrorMessage
                };
            }
        } else {
            return { success: false, message: 'Error inserting voltage entity, mrid is required'};
        }
    } catch (error) {
        let sqlErrorMessage = error?.message || error?.toString() || 'Unknown error'
        
        return { 
            success: false, 
            error: {
                message: error?.message || sqlErrorMessage,
                errMessage: sqlErrorMessage,
                errCode: error?.err?.code
            }, 
            message: 'Error inserting voltage entity: ' + sqlErrorMessage
        };
    }
}

export const getVoltageLevelEntity = async (id) => {
    const data = {
        voltageLevel : null
    };
    try {
        if (!id) {
            return { success: false, message: 'Error retrieving voltage level entity: mrid is required' };
        }
        const dataVoltageLevel = await getVoltageLevelById(id);
        if (dataVoltageLevel.success) {
            data.voltageLevel = dataVoltageLevel.data;
            return { success: true, data : data, message: 'Voltage level entity retrieved successfully' };
        } else {
            return { 
                success: false, 
                message: dataVoltageLevel.message || 'Error retrieving voltage level entity',
                error: dataVoltageLevel.err || null
            };
        }
    } catch (error) {
        return { 
            success: false, 
            error: error,
            message: error?.message || 'Error retrieving voltage level entity' 
        };
    }
}

export const deleteVoltageLevelById = async (data) => {
    try {
        await runAsync('BEGIN TRANSACTION')
        if (data.voltageLevel && data.voltageLevel.mrid) {
            await deleteVoltageLevelByIdTransaction(data.voltageLevel.mrid, db);
        }
        await runAsync('COMMIT');
        return { success: true, data: data, message: 'Voltage level deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error deleting voltage level by id' };
    }
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
