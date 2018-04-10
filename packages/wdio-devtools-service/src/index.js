import logger from 'wdio-logger'
import CDP from 'chrome-remote-interface'

const log = logger('wdio-devtools-service')

const UNSUPPORTED_ERROR_MESSAGE = 'The wdio-devtools-service currently only supports Chrome version 63 and up'

export default class DevToolsService {
    constructor () {
        this.isSupported = false
    }

    beforeSession (_, caps) {
        if (caps.browserName !== 'chrome' || (caps.version && caps.version < 63)) {
            return log.error(UNSUPPORTED_ERROR_MESSAGE)
        }

        this.isSupported = true
    }

    async before () {
        if (!this.isSupported) {
            return global.browser.addCommand('cdp', () => {
                throw new Error(UNSUPPORTED_ERROR_MESSAGE)
            })
        }

        this.chromePort = await this._findChromePort()
        this.client = await this._getCDPClient(this.chromePort)

        /**
         * allow to easily access the CDP from the browser object
         */
        global.browser.addCommand('cdp', (domain, command, args = {}) => {
            if (!this.client[domain]) {
                throw new Error(`Domain "${domain}" doesn't exist in the Chrome DevTools protocol`)
            }

            if (!this.client[domain][command]) {
                throw new Error(`The "${domain}" domain doesn't have a method called "${command}"`)
            }

            return new Promise((resolve, reject) => this.client[domain][command](args, (err, result) => {
                if (err) {
                    return reject(new Error(`Chrome DevTools Error: ${result.message}`))
                }

                return resolve(result)
            }))
        })

        /**
         * helper method to receive Chrome remote debugging connection data to
         * e.g. use external tools like lighthouse
         */
        const { host, port } = this.client
        global.browser.addCommand('cdpConnection', () => ({ host, port }))

        /**
         * propagate CDP events to the browser event listener
         */
        this.client.on('event', (event) => {
            const method = event.method || 'event'
            log.debug(`cdp event: ${method} with params ${JSON.stringify(event.params)}`)
            global.browser.emit(method, event.params)
        })
    }

    async _findChromePort () {
        try {
            await global.browser.url('chrome://version')

            const cmdLine = await global.browser.$('#command_line')
            return cmdLine.getText().then((args) => parseInt(args.match(/--remote-debugging-port=(\d*)/)[1]))
        } catch (err) {
            log.error(`Couldn't connect to chrome: ${err.stack}`)
        }
    }

    async _getCDPClient (port) {
        return new Promise((resolve) => CDP({
            port,
            host: 'localhost',
            target: (targets) => targets.findIndex((t) => t.type === 'page')
        }, resolve))
    }
}
