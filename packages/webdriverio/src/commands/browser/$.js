/**
 * The `$` command is a short way to call the [`element`](/api/protocol/element.html) command in order
 * to fetch a single element on the page. It returns an object that with an extended prototype to call
 * action commands without passing in a selector. However if you still pass in a selector it will look
 * for that element first and call the action on that element.
 *
 * Using the wdio testrunner this command is a global variable else it will be located on the browser object instead.
 *
 * You can chain `$` or `$$` together in order to walk down the DOM tree.
 *
 * <example>
    :index.html
    <ul id="menu">
        <li><a href="/">Home</a></li>
        <li><a href="/">Developer Guide</a></li>
        <li><a href="/">API</a></li>
        <li><a href="/">Contribute</a></li>
    </ul>
    :$.js
    it('should get text a menu link', function () {
        var text = $('#menu');
        console.log(text.$$('li')[2].$('a').getText()); // outputs: "API"
        // same as
        console.log(text.$$('li')[2].getText('a'));
    });
 * </example>
 *
 * @alias $
 * @param {String} selector  selector to fetch a certain element
 * @type utility
 *
 */
import { webdriverMonad, getPrototype as getWebdriverPrototype } from 'webdriver'
import { wrapCommand } from 'wdio-config'

import { findStrategy, getPrototype as getWDIOPrototype, getElementFromResponse } from '../../utils'
import { elementErrorHandler } from '../../middlewares'

export default async function $ (selector) {
    const { using, value } = findStrategy(selector)
    const res = await this.findElement(using, value)

    const prototype = Object.assign(getWebdriverPrototype(), getWDIOPrototype('element'))
    prototype.scope = 'element'

    const element = webdriverMonad(this.options, (client) => {
        const elementId = getElementFromResponse(res)

        if (elementId) {
            client.elementId = elementId
        } else {
            client.error = res
        }

        client.selector = selector
        client.parent = this
        client.emit = ::this.emit
        return client
    }, prototype)

    return element(this.sessionId, elementErrorHandler(wrapCommand))
}
