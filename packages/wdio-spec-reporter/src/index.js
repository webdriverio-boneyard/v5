import WDIOReporter from 'wdio-reporter'
import chalk from 'chalk'
import prettyMs from 'pretty-ms'

class SpecReporter extends WDIOReporter {
    constructor () {
        super()

        // Keep track of the order that suites were called
        this.suiteUids = []

        this.suites = []
        this.indents = 0
        this.suiteIndents = {}
        this.defaultTestIndent = '   '
        this.stateCounts = {
            passed : 0,
            failed : 0,
            skipped : 0
        }
    }

    onSuiteStart (suite) {
        this.suiteUids.push(suite.uid)
        this.suiteIndents[suite.uid] = ++this.indents
    }

    onSuiteEnd (suite) {
        this.indents--
        this.suites.push(suite)
    }

    onTestPass () {
        this.stateCounts.passed++
    }

    onTestFail () {
        this.stateCounts.failed++
    }

    onTestSkip () {
        this.stateCounts.skipped++
    }

    onEnd (runner) {
        let output  = []
        let duration = `(${prettyMs(runner._duration)})`
        const preface = `[${this.getEnviromentCombo(runner.capabilities, false)} #${runner.cid}]`
        const combo = this.getEnviromentCombo(runner.capabilities)
        const divider = '------------------------------------------------------------------'

        // Session id won't be available when running multiremote tests
        if (runner.sessionID) {
            output.push(`Session ID: ${runner.sessionID}`)
        }

        // Spec file name
        output.push(`Spec: ${runner.specs[0]}`)

        // Enviroment information
        if (combo) {
            output.push(`Running: ${combo}`)
        }

        // Put line break after general header data
        output.push(' ')

        // Get the results
        const results = this.getResultDisplay()

        // If there are no test results then return nothing
        if (results.length === 0) {
            return
        }

        // Combine result output with the main output
        output = [...output, ...results]

        // Get the counts
        output = [...output, ...this.getCountDisplay(duration)]

        // Get failures, if any
        const failures = this.getFailureDisplay()

        if (failures.length > 0) {
            // Combine failures with the main output
            output = [...output, ...failures]
        }

        // Prefix all values with the browser information
        output = output.map((value) => {
            return `${preface} ${value}`
        })

        // Output the results
        process.stdout.write(`${divider}\n${output.join(`\n`)}\n\n\n`)
    }

    /**
     * Indent a suite based on where how it's nested
     * @param  {String} uid Unique suite key
     * @return {String}     Spaces for indentation
     */
    indent (uid) {
        const indents = this.suiteIndents[uid]
        return indents === 0 ? '' : Array(indents).join('    ')
    }

    /**
     * Get the results from the tests
     * @param  {Array} suites Runner suites
     * @return {Array}        Display output list
     */
    getResultDisplay () {
        const output = []
        const suites = this.getOrderedSuites()

        for (const suite of suites) {
            // Don't do anything if a suite has no tests
            if (suite.tests.length === 0) {
                continue
            }

            // Get the indent/starting point for this suite
            const suiteIndent = this.indent(suite.uid)

            // Display the title of the suite
            output.push(`${suiteIndent}${suite.title}`)

            for (const test of suite.tests) {
                const test_title = test.title
                const state = test.state
                const test_indent = `${this.defaultTestIndent}${suiteIndent}`

                // Output for a single test
                output.push(`${test_indent}${chalk[this.getColor(state)](this.getSymbol(state))} ${test_title}`)
            }

            // Put a line break after each suite
            output.push(' ')
        }

        return output
    }

    /**
     * Get the display for passing, failing and skipped
     * @param  {String} duration Duration string
     * @return {Array} Count display
     */
    getCountDisplay (duration) {
        const output = []

        // Get the passes
        if(this.stateCounts.passed > 0) {
            const text = `${this.stateCounts.passed} passing ${duration}`
            output.push(chalk[this.getColor(`passed`)](text))
            duration = ''
        }

        // Get the failures
        if(this.stateCounts.failed > 0) {
            const text = `${this.stateCounts.failed} failing ${duration}`
            output.push(chalk[this.getColor(`failed`)](text))
            duration = ''
        }

        // Get the skipped tests
        if(this.stateCounts.skipped > 0) {
            const text = `${this.stateCounts.skipped} skipped ${duration}`
            output.push(chalk[this.getColor(`skipped`)](text))
        }

        return output
    }

    /**
     * Get display for failed tests, e.g. stack trace
     * @return {Array} Stack trace output
     */
    getFailureDisplay () {
        let failureLength = 0
        const output = []
        const suites = this.getOrderedSuites()

        for (const suite of suites) {
            const suiteTitle = suite.title

            for (const test of suite.tests) {
                if(test.state !== 'failed') {
                    continue
                }

                const testTitle = test.title

                // If we get here then there is a failed test
                output.push(
                    ' ',
                    `${++failureLength}) ${suiteTitle} ${testTitle}`,
                    chalk.red(test.error.message),
                    ...test.error.stack.split(/\n/g).map(value => chalk.gray(value))
                )
            }
        }

        return output
    }

    /**
     * Get suites in the order they were called
     * @return {Array} Ordered suites
     */
    getOrderedSuites () {
        if (this.orderedSuites) {
            return this.orderedSuites
        }

        this.orderedSuites = []
        for (const uid of this.suiteUids) {
            for (const suite of this.suites) {
                if (suite.uid !== uid) {
                    continue
                }

                this.orderedSuites.push(suite)
            }
        }



        return this.orderedSuites
    }

    /**
     * Get a symbol based on state
     * @param  {String} state State of a test
     * @return {String}       Symbol to display
     */
    getSymbol (state) {
        const allSymbols = symbols()
        let symbol = '?' // in case of an unknown state

        switch (state) {
        case 'passed':
            symbol = allSymbols.ok
            break
        case 'skipped':
            symbol = '-'
            break
        case 'failed':
            symbol = allSymbols.err
            break
        }

        return symbol
    }

    /**
     * Get a color based on a given state
     * @param  {String} state Test state
     * @return {String}       State color
     */
    getColor (state) {
        // In case of an unknown state
        let color = null

        switch (state) {
        case 'passed':
            color = 'green'
            break
        case 'pending':
        case 'skipped':
            color = 'cyan'
            break
        case 'failed':
            color = 'red'
            break
        }

        return color
    }

    /**
     * Get information about the enviroment
     * @param  {Object}  caps    Enviroment details
     * @param  {Boolean} verbose
     * @return {String}          Enviroment string
     */
    getEnviromentCombo (caps, verbose = true) {
        const device = caps.deviceName
        const browser = caps.browserName || caps.browser
        const version = caps.version || caps.platformVersion || caps.browser_version
        const platform = caps.os ? (caps.os + ' ' + caps.os_version) : (caps.platform || caps.platformName)

        // Mobile capabilities
        if (device) {
            const program = (caps.app || '').replace('sauce-storage:', '') || caps.browserName
            const executing = program ? `executing ${program}` : ''

            if (!verbose) {
                return `${device} ${platform} ${version}`
            }

            return `${device} on ${platform} ${version} ${executing}`.trim()
        }

        if (!verbose) {
            return (browser + ' ' + (version || '') + ' ' + (platform || '')).trim()
        }

        return browser + (version ? ` (v${version})` : '') + (platform ? ` on ${platform}` : '')
    }
}

/**
 * @todo Move this into wdio-reporter/src/utils
 * Couldn't get this to import, I might be missing something with lerna
 *
 * list of reporting symbols
 * @return {Object} Symbols
 */
function symbols() {
    return {
        ok: '✓',
        err: '✖',
        dot: '․',
        error: 'F'
    }
}

export default SpecReporter
