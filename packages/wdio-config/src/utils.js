import pickBy from 'lodash.pickby'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 4444

/**
 * helper to detect the Selenium backend according to given capabilities
 */
export function detectBackend (options = {}) {
    const { port, host, key } = options

    /**
     * don't detect anything if host or port is given or
     * if no creds are given default to local WebDriver server
     */
    if (host || port || (!options.user && !options.key)) {
        return Object.assign({
            host: DEFAULT_HOST,
            port: DEFAULT_PORT
        }, pickBy({ host, port }))
    }

    /**
     * browserstack
     * e.g. zHcv9sZ39ip8ZPsxBVJ2
     */
    if (key.length === 20) {
        return Object.assign(pickBy({ host, port }), {
            host: 'hub.browserstack.com',
            port: 80
        })
    }

    /**
     * testingbot
     * e.g. ec337d7b677720a4dde7bd72be0bfc67
     */
    if (key.length === 32) {
        return Object.assign(pickBy({ host, port }), {
            host: 'hub.testingbot.com',
            port: 80
        })
    }

    /**
     * Sauce Labs
     * e.g. 50aa152c-1932-B2f0-9707-18z46q2n1mb0
     */
    return Object.assign(pickBy({ host, port }), {
        protocol: 'https',
        host: 'ondemand.saucelabs.com',
        port: 443
    })
}

/**
 * initialise WebdriverIO compliant plugins
 */
export function initialisePlugin (name, type) {
    /**
     * don't populate scoped package names
     */
    const pkgName = name[0] === '@' ? name : `wdio-${name.toLowerCase()}-${type}`

    try {
        return require(pkgName)
    } catch (e) {
        if (!e.message.match(`Cannot find module '${pkgName}'`)) {
            throw new Error(`Couldn't initialise ${type} "${name}".\n${e.stack}`)
        }

        throw new Error(
            `Couldn't find plugin "${pkgName}". You need to install it ` +
            `with \`$ npm install ${pkgName}\`!\n${e.stack}`
        )
    }
}

export function validateConfig (defaults, options) {
    const params = {}

    for (const [name, expectedOption] of Object.entries(defaults)) {
        /**
         * check if options is given
         */
        if (typeof options[name] === 'undefined' && !expectedOption.default && expectedOption.required) {
            throw new Error(`Required option "${name}" is missing`)
        }

        if (typeof options[name] === 'undefined' && expectedOption.default) {
            params[name] = expectedOption.default
        }

        if (typeof options[name] !== 'undefined') {
            if (typeof expectedOption.type === 'string' && typeof options[name] !== expectedOption.type) {
                throw new Error(`Expected option "${name}" to be type of ${expectedOption.type} but was ${typeof options[name]}`)
            }

            if (typeof expectedOption.type === 'function' && !expectedOption.type(options[name])) {
                throw new Error(`Option "${name}" failed type check ${expectedOption.type}`)
            }

            if (expectedOption.match && !options[name].match(expectedOption.match)) {
                throw new Error(`Option "${name}" doesn't match expected values: ${expectedOption.match}`)
            }

            params[name] = options[name]
        }
    }

    return params
}
