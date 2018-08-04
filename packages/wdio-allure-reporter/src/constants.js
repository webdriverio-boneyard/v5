const PASSED = 'passed';
const FAILED = 'failed';
const BROKEN = 'broken';
const PENDING = 'pending';

const testStatuses = {
    PASSED,
    FAILED,
    BROKEN,
    PENDING,
}

const stepStatuses = {
    PASSED,
    FAILED,
    BROKEN,
}

const events = {
    addFeature: 'allure:addFeature',
    addStory: 'allure:addStory',
    addSeverity: 'allure:addSeverity',
    addEnvironment: 'allure:addEnvironment',
    addDescription: 'allure:addDescription',
    addAttachment: 'allure:addAttachment',
    addStep: 'allure:addStep'
}

export {testStatuses, stepStatuses, events}
