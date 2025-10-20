// Surge Arrester Job Mapping
export const mapSurgeArresterJobData = (jobData) => {
    return {
        mrid: jobData.mrid || null,
        name: jobData.name || '',
        workOrder: jobData.workOrder || '',
        creationDate: jobData.creationDate || null,
        executionDate: jobData.executionDate || null,
        approvedBy: jobData.approvedBy || '',
        ambientCondition: jobData.ambientCondition || '',
        testedBy: jobData.testedBy || '',
        standard: jobData.standard || ''
    };
};

export const mapSurgeArresterJobToDto = (jobData) => {
    return mapSurgeArresterJobData(jobData);
};

export const mapDtoToSurgeArresterJob = (dto) => {
    return mapSurgeArresterJobData(dto);
};
