import WebDriver from 'webdriver'
import { validateConfig } from 'wdio-config'

import { WDIO_DEFAULTS } from './constants'
import { getPrototype } from './utils'

const remote = function (params = {}, remoteModifier) {
    const config = validateConfig(WDIO_DEFAULTS, params)
    const modifier = (client, options) => {
        options = Object.assign(options, config)

        if (typeof remoteModifier === 'function') {
            console.log(remoteModifier.toString());
            client = remoteModifier(client, options)
        }

        console.log('Yoo', client);

        return client
    }
    const prototype = getPrototype('browser')
    return WebDriver.newSession(params, modifier, prototype)
}

const multiremote = function () {
    /**
     * ToDo implement multiremote here
     */
    return 'NYI'
}

export { remote, multiremote }
