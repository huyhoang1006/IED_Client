// SurgeArrester Job DTO
export default class SurgeArresterJobDto {
    constructor() {
        this.mrid = null;
        this.name = null;
        this.workOrder = null;
        this.creationDate = null;
        this.executionDate = null;
        this.approvedBy = null;
        this.ambientCondition = null;
        this.testedBy = null;
        this.standard = null;
        this.testResults = [];
        this.attachments = [];
        this.createdAt = null;
        this.updatedAt = null;
    }

    setMRID(mrid) {
        this.mrid = mrid;
    }

    setName(name) {
        this.name = name;
    }

    setWorkOrder(workOrder) {
        this.workOrder = workOrder;
    }

    setCreationDate(date) {
        this.creationDate = date;
    }

    setExecutionDate(date) {
        this.executionDate = date;
    }

    setApprovedBy(approvedBy) {
        this.approvedBy = approvedBy;
    }

    setAmbientCondition(condition) {
        this.ambientCondition = condition;
    }

    setTestedBy(testedBy) {
        this.testedBy = testedBy;
    }

    setStandard(standard) {
        this.standard = standard;
    }

    addTestResult(result) {
        this.testResults.push(result);
    }

    addAttachment(attachment) {
        this.attachments.push(attachment);
    }

    toJSON() {
        return {
            mrid: this.mrid,
            name: this.name,
            workOrder: this.workOrder,
            creationDate: this.creationDate,
            executionDate: this.executionDate,
            approvedBy: this.approvedBy,
            ambientCondition: this.ambientCondition,
            testedBy: this.testedBy,
            standard: this.standard,
            testResults: this.testResults,
            attachments: this.attachments,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        const dto = new SurgeArresterJobDto();
        dto.mrid = data.mrid;
        dto.name = data.name;
        dto.workOrder = data.workOrder;
        dto.creationDate = data.creationDate;
        dto.executionDate = data.executionDate;
        dto.approvedBy = data.approvedBy;
        dto.ambientCondition = data.ambientCondition;
        dto.testedBy = data.testedBy;
        dto.standard = data.standard;
        dto.testResults = data.testResults || [];
        dto.attachments = data.attachments || [];
        dto.createdAt = data.createdAt;
        dto.updatedAt = data.updatedAt;
        return dto;
    }
}
