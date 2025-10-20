// VoltageLevel Mapping functions
export const mapVoltageLevelData = (voltageLevelData) => {
    return {
        mrid: voltageLevelData.mrid || null,
        name: voltageLevelData.name || '',
        description: voltageLevelData.description || '',
        nominalVoltage: voltageLevelData.nominalVoltage || 0,
        voltageMultiplier: voltageLevelData.voltageMultiplier || 0,
        voltageUnit: voltageLevelData.voltageUnit || '',
        baseVoltage: voltageLevelData.baseVoltage || null,
        substation: voltageLevelData.substation || null,
        bays: voltageLevelData.bays || []
    };
};

export const mapVoltageLevelToDto = (voltageLevelData) => {
    return mapVoltageLevelData(voltageLevelData);
};

export const mapDtoToVoltageLevel = (dto) => {
    return mapVoltageLevelData(dto);
};
