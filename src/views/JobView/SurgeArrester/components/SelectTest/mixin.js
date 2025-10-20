// SelectTest Mixin
export default {
    data() {
        return {
            selectedTestType: '',
            availableTests: [
                { value: 'insulation', label: 'Insulation Resistance' },
                { value: 'leakage', label: 'Leakage Current' },
                { value: 'power', label: 'Power Frequency' },
                { value: 'impulse', label: 'Impulse Withstand' }
            ]
        };
    },
    methods: {
        selectTest(testType) {
            this.selectedTestType = testType;
            this.$emit('test-selected', testType);
        },
        resetSelection() {
            this.selectedTestType = '';
        }
    }
};
