const { contextBridge, ipcRenderer } = require('electron')

// Import all preload modules
// Note: Since we're using CommonJS, we need to use require for ES modules
// This file will be built/compiled to merge all preload modules

// For now, we'll directly define the APIs here
// In production, this should be built from src/preload modules

contextBridge.exposeInMainWorld('electronAPI', {
    // User APIs
    login: (user) => ipcRenderer.invoke('login', user),
    signup: (user) => ipcRenderer.invoke('signup', user),
    changePass: (user) => ipcRenderer.invoke('changePass', user),
    getAllUser: () => ipcRenderer.invoke('getAllUser'),
    editUserInfo: (user) => ipcRenderer.invoke('editUserInfo', user),
    addUser: (user) => ipcRenderer.invoke('addUser', user),
    deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),

    // Configuration Event APIs
    getConfigurationEventByMrid: (mrid) => ipcRenderer.invoke('getConfigurationEventByMrid', mrid),
    getAllConfigurationEvents: () => ipcRenderer.invoke('getAllConfigurationEvents'),
    insertConfigurationEvent: (data) => ipcRenderer.invoke('insertConfigurationEvent', data),
    updateConfigurationEventByMrid: (mrid, data) => ipcRenderer.invoke('updateConfigurationEventByMrid', mrid, data),
    deleteConfigurationEventByMrid: (mrid) => ipcRenderer.invoke('deleteConfigurationEventByMrid', mrid),

    // Parent Organization APIs
    insertParentOrganization: (data) => ipcRenderer.invoke('insertParentOrganization', data),
    getParentOrganizationByMrid: (mrid) => ipcRenderer.invoke('getParentOrganizationByMrid', mrid),
    getParentOrganizationByParentMrid: (mrid) => ipcRenderer.invoke('getParentOrganizationByParentMrid', mrid),
    updateParentOrganizationByMrid: (mrid, data) => ipcRenderer.invoke('updateParentOrganizationByMrid', mrid, data),
    deleteParentOrganizationByMrid: (mrid) => ipcRenderer.invoke('deleteParentOrganizationByMrid', mrid),

    // Parent Organization Entity APIs
    insertParentOrganizationEntity: (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
    updateParentOrganizationEntity: (data) => ipcRenderer.invoke('updateParentOrganizationEntity', data),
    getOrganisationEntityByMrid: (id) => ipcRenderer.invoke('getOrganisationEntityByMrid', id),
    deleteParentOrganizationEntity: (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data),
    deleteParentOrganizationEntityByMrid: (data) => ipcRenderer.invoke('deleteParentOrganizationEntity', data),

    // Substation APIs
    getSubstationByMrid: (mrid) => ipcRenderer.invoke('getSubstationByMrid', mrid),
    getSubstationsInOrganisationForUser: (mrid, user_id) => ipcRenderer.invoke('getSubstationsInOrganisationForUser', mrid, user_id),
    insertSubstation: (data) => ipcRenderer.invoke('insertSubstation', data),
    updateSubstationByMrid: (mrid, data) => ipcRenderer.invoke('updateSubstationByMrid', mrid, data),
    deleteSubstationByMrid: (mrid) => ipcRenderer.invoke('deleteSubstationByMrid', mrid),

    // Substation Entity APIs
    insertSubstationEntity: (entity) => ipcRenderer.invoke('insertSubstationEntity', entity),
    getSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('getSubstationEntityByMrid', mrid),
    updateSubstationEntityByMrid: (mrid, entity) => ipcRenderer.invoke('updateSubstationEntityByMrid', mrid, entity),
    deleteSubstationEntityByMrid: (mrid) => ipcRenderer.invoke('deleteSubstationEntityByMrid', mrid),

    // Person APIs
    getPersonByOrganisationId: (organisationId) => ipcRenderer.invoke('getPersonByOrganisationId', organisationId),
    getPersonByMrid: (mrid) => ipcRenderer.invoke('getPersonByMrid', mrid),
    insertPerson: (data) => ipcRenderer.invoke('insertPerson', data),
    updatePersonByMrid: (mrid, data) => ipcRenderer.invoke('updatePersonByMrid', mrid, data),
    deletePersonByMrid: (mrid) => ipcRenderer.invoke('deletePersonByMrid', mrid),

    // Person Role APIs
    getPersonRoleByPersonId: (personId) => ipcRenderer.invoke('getPersonRoleByPersonId', personId),

    // Location APIs
    getLocationByOrganisationId: (organisationId) => ipcRenderer.invoke('getLocationByOrganisationId', organisationId),
    getLocationByPowerSystemResourceMrid: (mrid) => ipcRenderer.invoke('getLocationByPowerSystemResourceMrid', mrid),
    getLocationDetailByMrid: (mrid) => ipcRenderer.invoke('getLocationDetailByMrid', mrid),

    // Street Address APIs
    getStreetAddressByMrid: (mrid) => ipcRenderer.invoke('getStreetAddressByMrid', mrid),

    // Street Detail APIs
    getStreetDetailByLocationId: (locationId) => ipcRenderer.invoke('getStreetDetailByLocationId', locationId),
    getStreetDetailById: (id) => ipcRenderer.invoke('getStreetDetailById', id),

    // Town Detail APIs
    getTownDetailByLocationId: (locationId) => ipcRenderer.invoke('getTownDetailByLocationId', locationId),

    // Electronic Address APIs
    getElectronicAddressByMrid: (mrid) => ipcRenderer.invoke('getElectronicAddressByMrid', mrid),

    // Telephone Number APIs
    getTelephoneNumberByMrid: (mrid) => ipcRenderer.invoke('getTelephoneNumberByMrid', mrid),

    // Position Point APIs
    getPositionPointByLocationId: (locationId) => ipcRenderer.invoke('getPositionPointByLocationId', locationId),

    // Voltage Level APIs
    getVoltageLevelBySubstationId: (substationId) => ipcRenderer.invoke('getVoltageLevelBySubstationId', substationId),
    getVoltageLevelByMrid: (mrid) => ipcRenderer.invoke('getVoltageLevelByMrid', mrid),
    getVoltageLevelEntityByMrid: (mrid) => ipcRenderer.invoke('getVoltageLevelEntityByMrid', mrid),
    insertVoltageLevelEntity: (data) => ipcRenderer.invoke('insertVoltageLevelEntity', data),
    deleteVoltageLevelEntityByMrid: (data) => ipcRenderer.invoke('deleteVoltageLevelEntityByMrid', data),

    // Bay APIs
    getBayByVoltageBySubstationId: (voltageLevelId, substationId) => ipcRenderer.invoke('getBayByVoltageBySubstationId', voltageLevelId, substationId),
    insertBayEntity: (data) => ipcRenderer.invoke('insertBayEntity', data),
    getBayEntityByMrid: (mrid) => ipcRenderer.invoke('getBayEntityByMrid', mrid),
    deleteBayEntityByMrid: (data) => ipcRenderer.invoke('deleteBayEntityByMrid', data),

    // Asset APIs
    getAssetByPsrIdAndKind: (psrId, kind) => ipcRenderer.invoke('getAssetByPsrIdAndKind', psrId, kind),
    getAssetByMrid: (mrid) => ipcRenderer.invoke('getAssetByMrid', mrid),
    getBushingByPsrId: (psrId) => ipcRenderer.invoke('getBushingByPsrId', psrId),

    // Surge Arrester APIs
    getSurgeArresterByMrid: (mrid) => ipcRenderer.invoke('getSurgeArresterByMrid', mrid),
    getSurgeArresterEntityByMrid: (mrid) => ipcRenderer.invoke('getSurgeArresterEntityByMrid', mrid),
    deleteSurgeArresterEntity: (data) => ipcRenderer.invoke('deleteSurgeArresterEntity', data),

    // Power Cable APIs
    getPowerCableEntityByMrid: (mrid, parentId) => ipcRenderer.invoke('getPowerCableEntityByMrid', mrid, parentId),
    deletePowerCableEntity: (data) => ipcRenderer.invoke('deletePowerCableEntity', data),

    // Disconnector APIs
    getDisconnectorEntityByMrid: (mrid, parentId) => ipcRenderer.invoke('getDisconnectorEntityByMrid', mrid, parentId),
    deleteDisconnectorEntity: (data) => ipcRenderer.invoke('deleteDisconnectorEntity', data),

    // Voltage Transformer APIs
    getVoltageTransformerEntityByMrid: (mrid, parentId) => ipcRenderer.invoke('getVoltageTransformerEntityByMrid', mrid, parentId),
    deleteVoltageTransformerEntity: (data) => ipcRenderer.invoke('deleteVoltageTransformerEntity', data),

    // Product Asset Model APIs
    getProductAssetModelByMrid: (mrid) => ipcRenderer.invoke('getProductAssetModelByMrid', mrid),

    // Old Work APIs
    getOldWorkByAssetId: (assetId) => ipcRenderer.invoke('getOldWorkByAssetId', assetId),

    // Test Type APIs
    getAllTestTypeSurgeArrester: () => ipcRenderer.invoke('getAllTestTypeSurgeArrester'),

    // Attachment APIs
    getAttachmentpath: () => ipcRenderer.invoke('getAttachmentpath'),
    insertAttachment: (attachment) => ipcRenderer.invoke('insertAttachment', attachment),
    getAttachmentById: (id_foreign, type) => ipcRenderer.invoke('getAttachmentById', id_foreign, type),
    updateAttachmentById: (id) => ipcRenderer.invoke('updateAttachmentById', id),
    getAttachmentByForeignIdAndType: (id_foreign, type) => ipcRenderer.invoke('getAttachmentByForeignIdAndType', id_foreign, type),
    deleteAttachmentById: (id) => ipcRenderer.invoke('deleteAttachmentById', id),
    openFile: (path) => ipcRenderer.invoke('openFile', path),
    downloadFile: (path) => ipcRenderer.invoke('downloadFile', path),
    readFileData: (file_Path) => ipcRenderer.invoke('readFileData', file_Path),
    downloadFileData: (base64, dirFile) => ipcRenderer.invoke('downloadFileData', base64, dirFile),

    // Window control APIs
    closeApp: () => ipcRenderer.send('closeApp'),
    minimizeApp: () => ipcRenderer.send('minimizeApp'),
    maximizeApp: () => ipcRenderer.send('maximizeApp'),
})

