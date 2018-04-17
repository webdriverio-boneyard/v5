import fs from 'fs'
import EventEmitter from 'events'

import SuiteStats from './stats/suite'
import HookStats from './stats/hook'
import TestStats from './stats/test'

import RunnerStats from './stats/runner'

export default class WDIOReporter extends EventEmitter {
    constructor (options) {
        super()
        this.options = options
        this.outputStream = this.options.stdout ? options.writeStream : fs.createWriteStream(this.options.logFile)
        this.failures = []
        this.suites = {}
        this.hooks = {}
        this.tests = {}
        this.counts = {
            suites: 0,
            tests: 0,
            hooks: 0,
            passes: 0,
            skipping: 0,
            failures: 0
        }

        let currentTest

        const rootSuite = this.currentSuite = new SuiteStats({
            title: '(root)',
            fullTitle: '(root)',
        })

        this.on('client:beforeCommand', ::this.onBeforeCommand)
        this.on('client:afterCommand', ::this.onAfterCommand)

        this.on('runner:start', (runner) => {
            rootSuite.cid = runner.cid
            this.runnerStat = new RunnerStats(runner)
            this.onRunnerStart(this.runnerStat)
        })

        this.on('suite:start', (suite) => {
            const currentSuite = new SuiteStats(suite)
            this.currentSuite.suites.push(currentSuite)
            this.currentSuite = currentSuite
            this.suites[suite.uid] = currentSuite
            this.onSuiteStart(currentSuite)
        })

        this.on('hook:start', (hook) => {
            const hookStat = new HookStats(hook)
            this.currentSuite.hooks.push(hookStat)
            this.hooks[hook.uid] = hookStat
            this.onHookStart(hookStat)
        })

        this.on('hook:end', (hook) => {
            const hookStat = this.hooks[hook.uid]
            hookStat.complete()
            this.counts.hooks++
            this.onHookEnd(hookStat)
        })

        this.on('test:start', (test) => {
            currentTest = new TestStats(test)
            this.currentSuite.tests.push(currentTest)
            this.tests[test.uid] = currentTest
            this.onTestStart(currentTest)
        })

        this.on('test:pass', (test) => {
            const testStat = this.tests[test.uid]
            testStat.pass()
            this.counts.passes++
            this.counts.tests++
            this.onTestPass(testStat)
        })

        this.on('test:fail', (test) => {
            const testStat = this.tests[test.uid]
            testStat.fail(test.error)
            this.counts.failures++
            this.counts.tests++
            this.onTestFail(testStat)
        })

        this.on('test:pending', (test) => {
            /**
             * tests that are skipped don't have a start event but a test end
             */
            const testStat = new TestStats(test)
            this.currentSuite.tests.push(testStat)
            this.tests[test.uid] = testStat
            testStat.skip()
            this.counts.skipping++
            this.counts.tests++
            this.onTestSkip(testStat)
        })

        this.on('test:end', (test) => {
            const testStat = this.tests[test.uid]
            this.onTestEnd(testStat)
        })

        this.on('suite:end', (suite) => {
            const suiteStat = this.suites[suite.uid]
            suiteStat.complete()
            this.onSuiteEnd(suiteStat)
        })

        this.on('runner:end', (runner) => {
            rootSuite.complete()
            this.runnerStat.failures = runner.failures
            this.runnerStat.complete()
            this.onRunnerEnd(this.runnerStat)
        })

        /**
         * browser client event handlers
         */
        this.on('client:command',
            (payload) => currentTest.output.push(Object.assign(payload, { type: 'command' })))
        this.on('client:result',
            (payload) => currentTest.output.push(Object.assign(payload, { type: 'result' })))
    }

    /**
     * function to write to reporters output stream
     */
    write (content) {
        this.outputStream.write(content)
    }

    onRunnerStart () {}
    onBeforeCommand () {}
    onAfterCommand () {}
    onScreenshot () {}
    onSuiteStart () {}
    onHookStart () {}
    onHookEnd () {}
    onTestStart () {}
    onTestPass () {}
    onTestFail () {}
    onTestSkip () {}
    onTestEnd () {}
    onSuiteEnd () {}
    onRunnerEnd () {}
}
