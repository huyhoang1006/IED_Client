import db from '../../datacontext/index.js'
import { insertBayTransaction, getBayById, deleteBayByIdTransaction} from '../../cim/bay/index.js';
import BayEntity from '../../../views/Entity/Bay/index.js';

export const insertBayEntity = async (entity) => { 
    try {
        const bay = entity.bay || entity
        if(bay && bay.mrid) {
            await runAsync('BEGIN TRANSACTION');
            await insertBayTransaction(bay, db);
            await runAsync('COMMIT')
            return { success: true, data: bay, message: 'Bay entity inserted successfully' };
        } else {
            console.error('Entity missing bay.mrid:', entity);
            return { success: false, message: 'Error inserting bay entity, bay.mrid is required'};
        }
    } catch (error) {
        console.error('Error inserting bay entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error inserting bay entity'};
    }
}

export const getBayEntity = async (id) => {
    try {
        const dataBay = await getBayById(id);
        if (dataBay.success) {
            return { success: true, data : dataBay.data, message: 'Bay entity retrieved successfully' };
        } else {
            return { success: false, message: 'Error retrieving bay entity' };
        }
    } catch (error) {
        console.error('Error retrieving bay entity:', error);
        return { success: false, error, message: 'Error retrieving bay entity' };
    }
}

export const getBayEntityByMrid = async (mrid) => {
    try {
        const bay = await getBayById(mrid);
        if (!bay.success) {
            return { success: false, message: 'Bay not found' };
        }
        
        const entity = new BayEntity();
        entity.bay = bay.data;
        
        // Populate related data
        try {
            // Get location from bay.location field
            const locationMrid = bay.data.location;
            
            if (locationMrid) {
                const LocationModule = await import('../../cim/location/index.js');
                const dataLocation = await LocationModule.getLocationById(locationMrid);
                if (dataLocation.success) {
                    entity.location = dataLocation.data;
                    
                    // Get street address if available
                    if (entity.location.main_address) {
                        const StreetAddressModule = await import('../../cim/streetAddress/index.js');
                        const dataStreetAddress = await StreetAddressModule.getStreetAddressById(entity.location.main_address);
                        if (dataStreetAddress.success) {
                            entity.streetAddress = dataStreetAddress.data;
                            
                            // Get street detail
                            if (entity.streetAddress.street_detail) {
                                const StreetDetailModule = await import('../../cim/streetDetail/index.js');
                                const dataStreetDetail = await StreetDetailModule.getStreetDetailById(entity.streetAddress.street_detail);
                                if (dataStreetDetail.success) {
                                    entity.streetDetail = dataStreetDetail.data;
                                }
                            }
                            
                            // Get town detail
                            if (entity.streetAddress.town_detail) {
                                const TownDetailModule = await import('../../cim/townDetail/index.js');
                                const dataTownDetail = await TownDetailModule.getTownDetailById(entity.streetAddress.town_detail);
                                if (dataTownDetail.success) {
                                    entity.townDetail = dataTownDetail.data;
                                }
                            }
                        }
                    }
                    
                    // Get position points
                    const PositionPointModule = await import('../../cim/positionPoint/index.js');
                    const dataPositionPoint = await PositionPointModule.getPositionPointByLocationId(entity.location.mrid);
                    if (dataPositionPoint.success) {
                        entity.positionPoint = dataPositionPoint.data;
                    }
                }
            }
            
            // Get PSR Type
            if (bay.data.psr_type_id) {
                const PsrTypeModule = await import('../../cim/psrType/index.js');
                const dataPrsType = await PsrTypeModule.getPsrTypeById(bay.data.psr_type_id);
                if (dataPrsType.success) {
                    entity.psrType = dataPrsType.data;
                }
            }
            
            // Get attachment
            const AttachmentModule = await import('../attachment/index.js');
            const dataAttachment = await AttachmentModule.getAttachmentByForeignIdAndType(bay.data.mrid, 'bay');
            if (dataAttachment.success) {
                entity.attachment = dataAttachment.data;
            }
        } catch (err) {
            console.error('Error loading related data:', err);
            // Continue anyway with partial data
        }
        
        return { success: true, data: entity, message: 'Bay entity retrieved successfully' };
    } catch (error) {
        console.error('Error retrieving bay entity:', error);
        return { success: false, error, message: 'Error retrieving bay entity' };
    }
}

export const deleteBayEntityById = async (data) => {
    try {
        // Lấy mrid từ nhiều nguồn có thể
        let mrid = data?.bay?.mrid || data?.mrid || (data?.bay && typeof data.bay === 'object' ? data.bay.mrid : null);
        
        if (!mrid) {
            console.error('deleteBayEntityById: mrid is missing.');
            return { success: false, error: new Error('MRID is required'), message: 'MRID is required for deletion' };
        }
        
        await runAsync('BEGIN TRANSACTION')
        const deleteResult = await deleteBayByIdTransaction(mrid, db);
        
        if (!deleteResult.success) {
            await runAsync('ROLLBACK');
            return deleteResult;
        }
        
        await runAsync('COMMIT');
        return { success: true, data: data, message: 'Bay deleted successfully' };
    } catch (error) {
        console.error('Error in deleteBayEntityById:', error)
        try {
            await runAsync('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error during rollback:', rollbackErr);
        }
        return { success: false, error, message: 'Error deleting bay by id' };
    }
}

export const deleteBayEntityByMrid = async (mrid) => {
    try {
        if (!mrid || mrid === '') {
            return { success: false, error: new Error('Invalid MRID') };
        }
        
        await runAsync('BEGIN TRANSACTION')

        const deleteResult = await deleteBayByIdTransaction(mrid, db);
        
        if (!deleteResult.success) {
            await runAsync('ROLLBACK');
            return deleteResult;
        }
        await runAsync('COMMIT');
        return { success: true, data: { mrid }, message: 'Bay deleted successfully' };
    } catch (error) {
        try {
            await runAsync('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error during rollback:', rollbackErr);
        }
        return { success: false, error, message: 'Error deleting bay entity by mrid' };
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
