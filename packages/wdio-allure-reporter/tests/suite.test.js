import {directory} from 'tempy';
import AllureReporter from '../src/'
import {runnerEnd, runnerStart} from './__fixtures__/runner'
import {clean, getResults} from './helper'
import {suiteEnd, suiteStart} from './__fixtures__/suite'
import {testFailed, testPassed, testPending, testStart} from './__fixtures__/testState'

describe('Passing tests', () => {
    const outputDir = directory();
    let allureXml;

    beforeAll(() => {
        const reporter = new AllureReporter({stdout: true, outputDir});

        reporter.onRunnerStart(runnerStart())
        reporter.onSuiteStart(suiteStart())
        reporter.onTestStart(testStart())
        reporter.addStory({storyName: 'Story'});
        reporter.addFeature( {featureName: 'foo'});
        reporter.addSeverity({severity: 'baz'});
        reporter.addEnvironment({name: 'jenkins', value: '1.2.3'});
        reporter.addDescription({description: 'functions', type: 'html'});
        reporter.addAttachment({name: 'My attachment', content: '99thoughtz', type: 'text/plain'});
        const step = {'step': {'attachment': {'content': 'baz', 'name': 'attachment'}, 'status': 'failed', 'title': 'foo'}};
        reporter.addStep(step)
        reporter.onTestPass(testPassed())
        reporter.onSuiteEnd(suiteEnd())
        reporter.onRunnerEnd(runnerEnd())

        const results = getResults(outputDir);
        expect(results).toHaveLength(1)
        allureXml = results[0]
    })

    afterAll(() => {
        clean(outputDir)
    })

    it('should report one suite', () => {
        expect(allureXml('ns2\\:test-suite > name').text()).toEqual('A passing Suite')
        expect(allureXml('ns2\\:test-suite > title').text()).toEqual('A passing Suite')
    })

    it('should detect passed test case', () => {
        expect(allureXml('ns2\\:test-suite > name').text()).toEqual('A passing Suite')
        expect(allureXml('test-case > name').text()).toEqual('should can do something')
        expect(allureXml('test-case').attr('status')).toEqual('passed')
    })

    it('should detect analytics labels in test case', () => {
        expect(allureXml('test-case label[name="language"]').eq(0).attr('value')).toEqual('javascript')
        expect(allureXml('test-case label[name="framework"]').eq(0).attr('value')).toEqual('wdio')
    })

    it('should add browser name as test argument', () => {
        expect(allureXml('test-case parameter[kind="argument"]')).toHaveLength(1)
        expect(allureXml('test-case parameter[name="browser"]').eq(0).attr('value')).toEqual('chrome')
    })

    it('should add story, feature, severity labels', function () {
        expect(allureXml('test-case label[name="feature"]').eq(0).attr('value')).toEqual('foo')
        expect(allureXml('test-case label[name="story"]').eq(0).attr('value')).toEqual('Story')
        expect(allureXml('test-case label[name="severity"]').eq(0).attr('value')).toEqual('baz')
    });

    it('should add story, feature, severity labels', function () {
        expect(allureXml('test-case label[name="feature"]').eq(0).attr('value')).toEqual('foo')
        expect(allureXml('test-case label[name="story"]').eq(0).attr('value')).toEqual('Story')
        expect(allureXml('test-case label[name="severity"]').eq(0).attr('value')).toEqual('baz')
    });

    it('should add environment variable', () => {
        expect(allureXml('test-case parameter[kind="environment-variable"]')).toHaveLength(1)
        expect(allureXml('test-case parameter[name="jenkins"]').eq(0).attr('value')).toEqual('1.2.3')
    })

    it('should add custom step', () => {
        expect(allureXml('step > name').eq(0).text()).toEqual('foo')
        expect(allureXml('step > title').eq(0).text()).toEqual('foo')
        expect(allureXml('test-case attachment[title="attachment"]')).toHaveLength(1)
        expect(allureXml('step').eq(0).attr('status')).toEqual('failed')
    })

    it('should add attachment', () => {
        expect(allureXml('test-case attachment[title="My attachment"]')).toHaveLength(1)
    })
});

describe('Failed tests', () => {
    let outputDir;
    let allureXml;

    beforeEach(() => {
        outputDir = directory();
    })

    afterEach(() => {
        clean(outputDir)
    })

    it('should detect failed test case', () => {
        const reporter = new AllureReporter({stdout: true, outputDir});

        reporter.onRunnerStart(runnerStart())
        reporter.onSuiteStart(suiteStart())
        reporter.onTestStart(testStart())
        reporter.onTestFail(testFailed())
        reporter.onSuiteEnd(suiteEnd())
        reporter.onRunnerEnd(runnerEnd())

        const results = getResults(outputDir);
        expect(results).toHaveLength(1)
        allureXml = results[0]

        expect(allureXml('test-case > name').text()).toEqual('should can do something')
        expect(allureXml('test-case').attr('status')).toEqual('failed')
    })

    it('should detect failed test case without start event', () => {
        const reporter = new AllureReporter({stdout: true, outputDir});

        reporter.onRunnerStart(runnerStart())
        reporter.onSuiteStart(suiteStart())
        reporter.onTestFail(testFailed())
        reporter.onSuiteEnd(suiteEnd())
        reporter.onRunnerEnd(runnerEnd())

        const results = getResults(outputDir);
        expect(results).toHaveLength(1)
        allureXml = results[0]

        expect(allureXml('test-case > name').text()).toEqual('should can do something')
        expect(allureXml('test-case').attr('status')).toEqual('failed')
    })
});

describe('Pending tests', () => {
    let outputDir;

    afterEach(() => {
        clean(outputDir)
    })

    it('should detect started pending test case', () => {
        outputDir = directory();
        const reporter = new AllureReporter({stdout: true, outputDir});

        reporter.onRunnerStart(runnerStart())
        reporter.onSuiteStart(suiteStart())
        reporter.onTestStart(testStart())
        reporter.onTestSkip(testPending())
        reporter.onSuiteEnd(suiteEnd())
        reporter.onRunnerEnd(runnerEnd())

        const results = getResults(outputDir);
        expect(results).toHaveLength(1)
        const allureXml = results[0]

        expect(allureXml('test-case > name').text()).toEqual('should can do something')
        expect(allureXml('test-case').attr('status')).toEqual('pending')
    })

    it('should detect not started pending test case', () => {
        outputDir = directory();
        const reporter = new AllureReporter({stdout: true, outputDir});

        reporter.onRunnerStart(runnerStart())
        reporter.onSuiteStart(suiteStart())
        reporter.onTestSkip(testPending())
        reporter.onSuiteEnd(suiteEnd())
        reporter.onRunnerEnd(runnerEnd())

        const results = getResults(outputDir);
        expect(results).toHaveLength(1)
        const allureXml = results[0]

        expect(allureXml('test-case > name').text()).toEqual('should can do something')
        expect(allureXml('test-case').attr('status')).toEqual('pending')
    })
});
