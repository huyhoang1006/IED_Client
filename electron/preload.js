const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database APIs
  db: {
    all: (sql, params) => ipcRenderer.invoke('db:all', sql, params),
    get: (sql, params) => ipcRenderer.invoke('db:get', sql, params),
    run: (sql, params) => ipcRenderer.invoke('db:run', sql, params)
  },

  // Manufacturer APIs
  getManufacturerByType: (type) => ipcRenderer.invoke('getManufacturerByType', type),
  getManufacturerByTypeAndName: (type, name) => ipcRenderer.invoke('getManufacturerByTypeAndName', type, name),
  getManufacturerByName: (name) => ipcRenderer.invoke('getManufacturerByName', name),
  insertManufacturer: (name, type) => ipcRenderer.invoke('insertManufacturer', name, type),
  updateManufacturerByName: (name, data) => ipcRenderer.invoke('updateManufacturerByName', name, data),
  updateManufacturerById: (id, data) => ipcRenderer.invoke('updateManufacturerById', id, data),
  deleteManufacturerByName: (name) => ipcRenderer.invoke('deleteManufacturerByName', name),
  deleteManufacturerById: (id) => ipcRenderer.invoke('deleteManufacturerById', id),

  // Owner APIs
  getOwnerByName: (name) => ipcRenderer.invoke('getOwnerByName', name),
  getOwnerByPhone: (phone) => ipcRenderer.invoke('getOwnerByPhone', phone),
  getOwnerById: (id) => ipcRenderer.invoke('getOwnerById', id),
  getOwnerByUserId: (user_id) => ipcRenderer.invoke('getOwnerByUserId', user_id),
  getOwnerByRefId: (ref_id) => ipcRenderer.invoke('getOwnerByRefId', ref_id),
  insertOwner: (data) => ipcRenderer.invoke('insertOwner', data),
  updateOwnerById: (id, data) => ipcRenderer.invoke('updateOwnerById', id, data),
  deleteOwnerById: (id) => ipcRenderer.invoke('deleteOwnerById', id),
  deleteOwner: (ids) => ipcRenderer.invoke('deleteOwner', ids),

  // Asset APIs
  getAssetByMrid: (mrid) => ipcRenderer.invoke('getAssetByMrid', mrid),
  getAllAssets: () => ipcRenderer.invoke('getAllAssets'),
  insertAsset: (data) => ipcRenderer.invoke('insertAsset', data),
  updateAsset: (mrid, data) => ipcRenderer.invoke('updateAsset', mrid, data),
  deleteAsset: (mrid) => ipcRenderer.invoke('deleteAsset', mrid),

  // User APIs
  getUserByUsername: (username) => ipcRenderer.invoke('getUserByUsername', username),
  getUserById: (id) => ipcRenderer.invoke('getUserById', id),
  getAllUsers: () => ipcRenderer.invoke('getAllUsers'),
  insertUser: (data) => ipcRenderer.invoke('insertUser', data),
  updateUser: (id, data) => ipcRenderer.invoke('updateUser', id, data),
  deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),

  // Person APIs
  getPersonByOrganisationId: (organisationId) => ipcRenderer.invoke('getPersonByOrganisationId', organisationId),

  // Location APIs
  getLocationByMrid: (mrid) => ipcRenderer.invoke('getLocationByMrid', mrid),
  getLocationByOrganisationId: (organisationId) => ipcRenderer.invoke('getLocationByOrganisationId', organisationId),
  getAllLocations: () => ipcRenderer.invoke('getAllLocations'),
  insertLocation: (data) => ipcRenderer.invoke('insertLocation', data),
  updateLocation: (mrid, data) => ipcRenderer.invoke('updateLocation', mrid, data),
  deleteLocation: (mrid) => ipcRenderer.invoke('deleteLocation', mrid),

  // Organisation APIs
  getOrganisationByMrid: (mrid) => ipcRenderer.invoke('getOrganisationByMrid', mrid),
  getOrganisationEntityByMrid: (mrid) => ipcRenderer.invoke('getOrganisationEntityByMrid', mrid),
  getParentOrganizationByMrid: (mrid) => ipcRenderer.invoke('getParentOrganizationByMrid', mrid),
  getParentOrganizationByParentMrid: (parentMrid) => ipcRenderer.invoke('getParentOrganizationByParentMrid', parentMrid),
  getSubstationsInOrganisationForUser: (organisationMrid, userId) => ipcRenderer.invoke('getSubstationsInOrganisationForUser', organisationMrid, userId),
  getAllOrganisations: () => ipcRenderer.invoke('getAllOrganisations'),
  insertOrganisation: (data) => ipcRenderer.invoke('insertOrganisation', data),
  insertParentOrganizationEntity: (data) => ipcRenderer.invoke('insertParentOrganizationEntity', data),
  updateOrganisation: (mrid, data) => ipcRenderer.invoke('updateOrganisation', mrid, data),
  deleteOrganisation: (mrid) => ipcRenderer.invoke('deleteOrganisation', mrid),

  // Job APIs
  getJobByMrid: (mrid) => ipcRenderer.invoke('getJobByMrid', mrid),
  getAllJobs: () => ipcRenderer.invoke('getAllJobs'),
  insertJob: (data) => ipcRenderer.invoke('insertJob', data),
  updateJob: (mrid, data) => ipcRenderer.invoke('updateJob', mrid, data),
  deleteJob: (mrid) => ipcRenderer.invoke('deleteJob', mrid),

  // Test APIs
  getTestByMrid: (mrid) => ipcRenderer.invoke('getTestByMrid', mrid),
  getAllTests: () => ipcRenderer.invoke('getAllTests'),
  insertTest: (data) => ipcRenderer.invoke('insertTest', data),
  updateTest: (mrid, data) => ipcRenderer.invoke('updateTest', mrid, data),
  deleteTest: (mrid) => ipcRenderer.invoke('deleteTest', mrid),

  // Circuit Breaker APIs
  getCircuitBreakerByMrid: (mrid) => ipcRenderer.invoke('getCircuitBreakerByMrid', mrid),
  getAllCircuitBreakers: () => ipcRenderer.invoke('getAllCircuitBreakers'),
  insertCircuitBreaker: (data) => ipcRenderer.invoke('insertCircuitBreaker', data),
  updateCircuitBreaker: (mrid, data) => ipcRenderer.invoke('updateCircuitBreaker', mrid, data),
  deleteCircuitBreaker: (mrid) => ipcRenderer.invoke('deleteCircuitBreaker', mrid),

  // Current Transformer APIs
  getCurrentTransformerByMrid: (mrid) => ipcRenderer.invoke('getCurrentTransformerByMrid', mrid),
  getAllCurrentTransformers: () => ipcRenderer.invoke('getAllCurrentTransformers'),
  insertCurrentTransformer: (data) => ipcRenderer.invoke('insertCurrentTransformer', data),
  updateCurrentTransformer: (mrid, data) => ipcRenderer.invoke('updateCurrentTransformer', mrid, data),
  deleteCurrentTransformer: (mrid) => ipcRenderer.invoke('deleteCurrentTransformer', mrid),

  // Voltage Transformer APIs
  getVoltageTransformerByMrid: (mrid) => ipcRenderer.invoke('getVoltageTransformerByMrid', mrid),
  getAllVoltageTransformers: () => ipcRenderer.invoke('getAllVoltageTransformers'),
  insertVoltageTransformer: (data) => ipcRenderer.invoke('insertVoltageTransformer', data),
  updateVoltageTransformer: (mrid, data) => ipcRenderer.invoke('updateVoltageTransformer', mrid, data),
  deleteVoltageTransformer: (mrid) => ipcRenderer.invoke('deleteVoltageTransformer', mrid),

  // Disconnector APIs
  getDisconnectorByMrid: (mrid) => ipcRenderer.invoke('getDisconnectorByMrid', mrid),
  getAllDisconnectors: () => ipcRenderer.invoke('getAllDisconnectors'),
  insertDisconnector: (data) => ipcRenderer.invoke('insertDisconnector', data),
  updateDisconnector: (mrid, data) => ipcRenderer.invoke('updateDisconnector', mrid, data),
  deleteDisconnector: (mrid) => ipcRenderer.invoke('deleteDisconnector', mrid),

  // Surge Arrester APIs
  getSurgeArresterByMrid: (mrid) => ipcRenderer.invoke('getSurgeArresterByMrid', mrid),
  getAllSurgeArresters: () => ipcRenderer.invoke('getAllSurgeArresters'),
  insertSurgeArrester: (data) => ipcRenderer.invoke('insertSurgeArrester', data),
  updateSurgeArrester: (mrid, data) => ipcRenderer.invoke('updateSurgeArrester', mrid, data),
  deleteSurgeArrester: (mrid) => ipcRenderer.invoke('deleteSurgeArrester', mrid),

  // Power Cable APIs
  getPowerCableByMrid: (mrid) => ipcRenderer.invoke('getPowerCableByMrid', mrid),
  getAllPowerCables: () => ipcRenderer.invoke('getAllPowerCables'),
  insertPowerCable: (data) => ipcRenderer.invoke('insertPowerCable', data),
  updatePowerCable: (mrid, data) => ipcRenderer.invoke('updatePowerCable', mrid, data),
  deletePowerCable: (mrid) => ipcRenderer.invoke('deletePowerCable', mrid),

  // Transformer APIs
  getTransformerByMrid: (mrid) => ipcRenderer.invoke('getTransformerByMrid', mrid),
  getAllTransformers: () => ipcRenderer.invoke('getAllTransformers'),
  insertTransformer: (data) => ipcRenderer.invoke('insertTransformer', data),
  updateTransformer: (mrid, data) => ipcRenderer.invoke('updateTransformer', mrid, data),
  deleteTransformer: (mrid) => ipcRenderer.invoke('deleteTransformer', mrid),

  // Configuration Event APIs
  getAllConfigurationEvents: () => ipcRenderer.invoke('getAllConfigurationEvents'),

  // System APIs
  platform: process.platform,
  versions: process.versions,

  // Window control APIs
  closeApp: () => ipcRenderer.send('closeApp'),
  minimizeApp: () => ipcRenderer.send('minimizeApp'),
  maximizeApp: () => ipcRenderer.send('maximizeApp'),
  dropDownApp: () => ipcRenderer.send('dropDownApp'),
  
  // Alternative window control APIs using invoke 
  closeWindow: () => ipcRenderer.invoke('window:close'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  dropDownWindow: () => ipcRenderer.invoke('window:dropDown'),
  
  // Configuration Events API
  getAllConfigurationEvents: () => ipcRenderer.invoke('getAllConfigurationEvents'),
  
  // Parent Organization API
  getParentOrganizationByMrid: (mrid) => ipcRenderer.invoke('getParentOrganizationByMrid', mrid)
  ,
  // Authentication (login) via ipc
  login: (user) => ipcRenderer.invoke('login', user)
})