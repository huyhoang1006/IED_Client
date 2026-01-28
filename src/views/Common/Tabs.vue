<!-- eslint-disable -->
<template>
    <div ref="customTabs" class="custom-tabs">
        <div class="tabs-header">
            <div class="scroll-btn left" @click="scrollLeft"><i class="fa-solid fa-chevron-left"></i></div>
            <div class="tabs-header-data" ref="tabsHeader" @scroll="checkScroll">
                <div v-for="(tab, index) in tabs" :key="tab.mrid" @click="selectTab(tab, index)"
                    @mouseover="hoveredTab = tab.mrid" @mouseleave="hoveredTab = null" class="tab-item"
                    :class="{ active: activeTab?.mrid === tab.mrid }" ref="tabItems">
                    <i style="color: #FDD835;" class="fa-solid fa-folder-open mgr-10 mgl-10"></i>
                    <span v-if="tab.mode == 'organisation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'substation'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'voltageLevel'" class="tab-label">{{ tab.name }}</span>
                    <span v-else-if="tab.mode == 'bay'" class="tab-label">{{ tab.name }}</span>
                    <span class="close-icon mgr-10 mgl-10"
                        :class="{ visible: hoveredTab === tab.mrid || activeTab?.mrid === tab.mrid }"
                        @click.stop="closeTab(index)">✖</span>
                </div>
            </div>
            <div class="scroll-btn right" @click="scrollRight"><i class="fa-solid fa-angle-right"></i></div>
        </div>
        <div class="tabs-content">
            <div class="mgr-20 mgt-20 mgb-20 mgl-20" v-for="(item, index) in tabs" :key="item.mrid">
                <component mode="update" @reload="loadData" @organisation-saved="handleOrganisationSaved" v-show="activeTab?.mrid === item.mrid"
                    ref="componentLoadData" :sideData="sideSign" :is="checkTab(item)" :organisationId="item.parentId"
                    :parent="parentOrganization" :locationData="locationData" :personList="getPersonListForTab(item)" 
                    style="min-height: calc(100vh - 250px);">
                </component>
                <span class="tab-actions" v-show="activeTab?.mrid === item.mrid">
                    <el-button size="small" type="danger" @click="closeTab(index)">Close</el-button>
                    <el-button size="small" type="primary" @click="saveCtrlS()">Save</el-button>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */

import LocationViewData from '@/views/Substation/index.vue'
import OrganisationView from '@/views/Organisation/index.vue'
import * as subsMapper from '@/views/Mapping/Substation/index'
import * as bayMapper from '@/views/Mapping/Bay/index'
import * as orgMapper from '@/views/Mapping/Organisation/index.js'
import * as voltageMapper from '@/views/Mapping/VoltageLevel/index'

import VoltageLevel from '@/views/VoltageLevel/index.vue'
import Bay from '@/views/Bay/index.vue'

export default {
    name: "Tabs",
    components: {
        LocationViewData,
        OrganisationView,
        VoltageLevel,
        Bay,
    },
    model: {
        prop: 'value',
        event: 'input'
    },
    props: {
        value: Object,
        tabs: Array,
        side: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            activeTab: this.value,
            parentOrganization: {},
            locationData: {},
            personList: [],
            tabsData: [],
            indexTab: null,
            sideSign: this.side,
            hoveredTab: null,
            canScrollLeft: false,
            canScrollRight: false,
        }
    },
    methods: {
        async loadData(tab, index) {
            try {
                // Special handling for Root: allow Root even without mrid
                const isRoot = tab && (tab.name === 'Root' || tab.name?.includes('Root')) && (!tab.mrid || tab.mrid === (this.$constant?.ROOT || '00000000-0000-0000-0000-000000000000'));
                
                if (!tab || (!tab.mrid && !isRoot)) {
                    this.$message.error("Invalid tab data");
                    return;
                }
                
                // Ensure Root has mrid set
                if (isRoot && !tab.mrid) {
                    tab.mrid = this.$constant?.ROOT || '00000000-0000-0000-0000-000000000000';
                }
                if (index == null) {
                    index = this.tabs.findIndex(t => t && t.mrid === tab.mrid);
                    if (index === -1) {
                        this.$message.error("Tab not found");
                        return;
                    }
                }
                
                if (tab.mode === 'substation') {
                    const [dataLocation, dataPerson, dataEntity] = await Promise.all([
                        window.electronAPI.getLocationByOrganisationId(tab.parentId),
                        window.electronAPI.getPersonByOrganisationId(tab.parentId),
                        window.electronAPI.getSubstationEntityByMrid(tab.mrid)
                    ]);
                    const data = {
                        locationList: [],
                        personList: [],
                        dto: null,
                        substation: tab
                    }
                    if (dataLocation.success) {
                        data.locationList = dataLocation.data
                    } else {
                        data.locationList = []
                    }

                    if (dataPerson.success) {
                        data.personList = dataPerson.data
                    } else {
                        data.personList = []
                    }

                    if (dataEntity && dataEntity.success) {
                        try {
                            const dto = subsMapper.mapEntityToDto(dataEntity.data)
                            data.dto = dto
                        } catch (mapErr) {
                            console.error('Error mapping substation entity to DTO:', mapErr)
                            this.$message.error("Failed to map substation data")
                            // Continue with null dto to show empty form
                        }
                    } else {
                        console.error('dataEntity failed:', dataEntity)
                        // Don't return - show empty form instead
                        this.$message.warning("Substation data not found, showing empty form")
                        // data.dto will remain null, which should show empty form
                    }
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        this.$refs.componentLoadData[index].loadData(data);
                    } else {
                        console.error("Component not found at index:", index);
                    }
                } else if (tab.mode === 'organisation') {
                    // Load person list for organisation
                    const [dataPerson] = await Promise.all([
                        window.electronAPI.getPersonByOrganisationId(tab.parentId || tab.mrid)
                    ])
                    
                    // Load existing organisation entity if mrid exists; fallback to empty for new
                    if (tab.mrid) {
                        try {
                            const dataEntity = await window.electronAPI.getOrganisationEntityByMrid(tab.mrid)
                            if (dataEntity && dataEntity.success) {
                                const dto = orgMapper.mapEntityToDto(dataEntity.data)
                                const payload = {
                                    organisationId: dto.organisationId || tab.mrid,
                                    name: dto.name || tab.name || '',
                                    alias_name: dto.alias_name || '',
                                    tax_code: dto.tax_code || '',
                                    street: dto.street || '',
                                    ward_or_commune: dto.ward_or_commune || '',
                                    district_or_town: dto.district_or_town || '',
                                    city: dto.city || '',
                                    state_or_province: dto.state_or_province || '',
                                    country: dto.country || '',
                                    phoneNumber: dto.phoneNumber || '',
                                    fax: dto.fax || '',
                                    email: dto.email || '',
                                    comment: dto.comment || '',
                                    personName: dto.personName || '',
                                    personId: dto.personId || '',
                                    // Ensure department and position are explicitly set, even if empty string
                                    department: (dto.department !== undefined && dto.department !== null) ? String(dto.department) : '',
                                    position: (dto.position !== undefined && dto.position !== null) ? String(dto.position) : '',
                                    parentId: tab.parentId,
                                    parentName: tab.parentName,
                                    positionPoints: dto.positionPoints || { x: [], y: [], z: [] },
                                    attachment: dto.attachment || { id: '', name: null, path: '', type: 'organisation', id_foreign: '' },
                                    configurationEvent: dto.configurationEvent || [],
                                    isNew: false
                                }
                                if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                    this.$refs.componentLoadData[index].loadData(payload)
                                    // Set personList prop
                                    if (dataPerson.success && dataPerson.data) {
                                        this.$refs.componentLoadData[index].personListData = dataPerson.data
                                    }
                                }
                            } else {
                                // Special handling for Root: if not found in DB, use default Root data
                                const isRoot = tab.mrid === (this.$constant?.ROOT || '00000000-0000-0000-0000-000000000000')
                                if (isRoot) {
                                    const rootPayload = {
                                        organisationId: tab.mrid,
                                        name: tab.name || 'Root',
                                        tax_code: '',
                                        street: '',
                                        ward_or_commune: '',
                                        district_or_town: '',
                                        city: '',
                                        state_or_province: '',
                                        country: '',
                                        phoneNumber: '',
                                        fax: '',
                                        email: '',
                                        comment: '',
                                        parentId: tab.parentId || null,
                                        parentName: tab.parentName || '',
                                        positionPoints: { x: [], y: [], z: [] },
                                        attachment: { id: '', name: null, path: '', type: 'organisation', id_foreign: '' },
                                        configurationEvent: [],
                                        isNew: false
                                    }
                                    // Set personList for this tab
                                    if (dataPerson.success && dataPerson.data) {
                                        this.personList = dataPerson.data
                                    } else {
                                        this.personList = []
                                    }
                                    
                                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                        this.$refs.componentLoadData[index].loadData(rootPayload)
                                    }
                                } else {
                                    console.error('Failed to fetch organisation entity:', dataEntity)
                                    this.$message.error('Failed to load organisation data')
                                    // Set empty personList
                                    this.personList = []
                                }
                            }
                        } catch (err) {
                            // Special handling for Root on error
                            const isRoot = tab.mrid === (this.$constant?.ROOT || '00000000-0000-0000-0000-000000000000')
                            if (isRoot) {
                                const rootPayload = {
                                    organisationId: tab.mrid,
                                    name: tab.name || 'Root',
                                    tax_code: '',
                                    street: '',
                                    ward_or_commune: '',
                                    district_or_town: '',
                                    city: '',
                                    state_or_province: '',
                                    country: '',
                                    phoneNumber: '',
                                    fax: '',
                                    email: '',
                                    comment: '',
                                    personName: '',
                                    personId: '',
                                    department: '',
                                    position: '',
                                    parentId: tab.parentId || null,
                                    parentName: tab.parentName || '',
                                    positionPoints: { x: [], y: [], z: [] },
                                    attachment: { id: '', name: null, path: '', type: 'organisation', id_foreign: '' },
                                    configurationEvent: [],
                                    isNew: false
                                }
                                // Set personList for this tab
                                if (dataPerson.success && dataPerson.data) {
                                    this.personList = dataPerson.data
                                } else {
                                    this.personList = []
                                }
                                
                                if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                    this.$refs.componentLoadData[index].loadData(rootPayload)
                                }
                            } else {
                                console.error('Error loading organisation entity:', err)
                                this.$message.error('Failed to load organisation data')
                            }
                        }
                    } else {
                        const emptyOrgData = {
                            mrid: tab.mrid,
                            name: tab.name,
                            parentId: tab.parentId,
                            parentName: tab.parentName,
                            isNew: true
                        }
                        this.$nextTick(() => {
                            if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                                this.$refs.componentLoadData[index].loadData(emptyOrgData)
                            }
                        })
                    }
                } else if (tab.mode === 'voltageLevel') {
                    // Load VoltageLevel entity by MRID and map to DTO
                    const dataEntity = await window.electronAPI.getVoltageLevelByMrid(tab.mrid)
                    if (dataEntity && dataEntity.success) {
                        const dto = voltageMapper.mapEntityToDto(dataEntity.data)
                        const payload = { ...tab, dto }
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(dto)
                        }
                    } else {
                        console.error('Failed to fetch VoltageLevel entity:', dataEntity)
                        this.$message.error("Failed to load voltage level data")
                        return
                    }
                } else if (tab.mode === 'bay') {
                    const dataEntity = await window.electronAPI.getBayEntityByMrid(tab.mrid)
                    if (dataEntity && dataEntity.success) {
                        // Map Entity to DTO (similar to voltageLevel)
                        const dto = bayMapper.mapEntityToDto(dataEntity.data)
                        if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                            this.$refs.componentLoadData[index].loadData(dto)
                        }
                    } else {
                        console.error('Failed to fetch Bay entity:', dataEntity)
                        this.$message.error("Failed to load bay data");
                        return
                    }
                } else {
                    this.$message.warning(`Tab mode '${tab.mode}' is not supported yet`);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                this.$message.error("Failed to load tab data");
            }
        },
        async selectTab(tab, index) {
            try {
                this.indexTab = index
                this.activeTab = tab
                this.$emit('input', tab)
                this.$nextTick(() => {
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[index]) {
                        const component = this.$refs.componentLoadData[index]
                        // Chỉ gọi loadMapForView nếu component có method này
                        if (component && typeof component.loadMapForView === 'function') {
                            component.loadMapForView()
                        }
                    }
                })
            } catch (error) {
                console.error("Error selecting tab:", error);
            }
        },
        closeTab(index) {
            this.$emit('close-tab', index)
            if (this.indexTab === index) {
                this.indexTab = null;
            }
        },
        checkScroll() {
            this.$nextTick(() => {
                const header = this.$refs.tabsHeader
                if (header) {
                    this.canScrollLeft = header.scrollLeft > 0
                    this.canScrollRight = header.scrollLeft + header.clientWidth < header.scrollWidth
                }
            })
        },
        scrollLeft() {
            this.scrollTabs(-2)
        },
        scrollRight() {
            this.scrollTabs(2)
        },
        scrollTabs(step) {
            this.$nextTick(() => {
                const header = this.$refs.tabsHeader;
                const tabItems = this.$refs.tabItems;
                if (!header || !tabItems || tabItems.length === 0) return;
                const moveBy = step * (tabItems[0].offsetWidth || 50);
                if (moveBy) {
                    header.scrollBy({ left: moveBy, behavior: 'smooth' });
                    setTimeout(this.checkScroll, 300);
                }
            });
        },
        getPersonListForTab(tab) {
            return this.personList || []
        },
        checkTab(tab) {
            if (tab.mode == 'substation') {
                return 'LocationViewData'
            } else if (tab.mode == 'organisation') {
                return 'OrganisationView'
            } else if (tab.mode == 'voltageLevel') {
                return 'VoltageLevel'
            } else if (tab.mode == 'bay') {
                return 'Bay'
            } else {
                // Return null for unsupported modes to prevent component rendering errors
                return null;
            }
        },
        saveCtrlS() {
            try {
                if (this.indexTab !== null) {
                    if (this.$refs.componentLoadData && this.$refs.componentLoadData[this.indexTab]) {
                        this.$refs.componentLoadData[this.indexTab].saveCtrS()
                    }
                } else {
                    this.$message.error("Please select a tab to save data.")
                }
            } catch (error) {
                console.error("Error saving data:", error);
            }
        },
        
        handleOrganisationSaved(savedNode) {
            this.$emit('organisation-saved', savedNode);
        }
    }
}
</script>

<style scoped>
.custom-tabs {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
}

.tabs-header-data {
    display: flex;
    height: 100%;
    padding: 3px;
    gap: 8px;
    box-sizing: border-box;
    width: calc(100% - 40px);
    border-bottom: 1px rgb(224, 222, 222) solid;
    flex-wrap: nowrap;
    /* Không cho xuống dòng */
    overflow-x: hidden;
    overflow-y: hidden;
}

.tab-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: border-bottom 0.3s;
    height: 100%;
    white-space: nowrap;
}

.tab-item.active {
    border-bottom: 3px solid #012596;
    font-weight: bold;
}

.close-icon {
    cursor: pointer;
    color: red;
    font-size: 14px;
    visibility: hidden;
    width: 20px;
    text-align: center;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.close-icon.visible {
    visibility: visible;
}

.scroll-btn {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    cursor: pointer;
    font-size: 15px;
    color: #012596;
    align-items: center;
    justify-content: center;
    width: 20px;
}

.tabs-content {
    width: 100%;
    height: calc(100% - 40px);
    overflow-y: auto;
    /* Cho phép cuộn theo chiều dọc */
    overflow-x: auto;
    /* Scroll ngang vẫn hiển thị */
    scrollbar-width: none;
    /* Ẩn scrollbar dọc trên Firefox */
}

.tabs-content::-webkit-scrollbar {
    width: 0;
    /* Ẩn scrollbar dọc trên Chrome, Safari, Edge */
}

.tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
    width: 100%;
}
</style>