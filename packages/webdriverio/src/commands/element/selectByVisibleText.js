/**
 *
 * Select option with displayed text matching the argument.
 *
 * <example>
    :example.html
    <select id="selectbox">
        <option value="someValue0">uno</option>
        <option value="someValue1">dos</option>
        <option value="someValue2">tres</option>
        <option value="someValue3">cuatro</option>
        <option value="someValue4">cinco</option>
        <option value="someValue5">seis</option>
    </select>
    :selectByVisibleText.js
    it('demonstrate the selectByVisibleText command', function () {
        const selectBox = $('#selectbox');
        console.log(selectBox.getText('option:checked')); // returns "uno"
        selectBox.selectByVisibleText('cuatro');
        console.log(selectBox.getText('option:checked')); // returns "cuatro"
    })
 * </example>
 *
 * @alias browser.selectByVisibleText
 * @param {String} selector   select element that contains the options
 * @param {String} text       text of option element to get selected
 * @uses protocol/element, protocol/elementIdClick, protocol/elementIdElement
 * @type action
 *
 */


export default function selectByVisibleText (selector, text) {
    /**
     * get select element
     */
    return this.element(selector).then(element => {
        /**
         * check if element was found and throw error if not
         */
        if (!element.value) {
            throw new Error(`No such element: "${selector}"`)
        }

        /**
         * find option elem using xpath
         */
        let formatted = `"${text.trim()}"`

        if (/"/.test(text)) {
            formatted = 'concat("' + text.trim().split('"').join('", \'"\', "') + '")' // escape quotes
        }
        /* eslint-disable no-irregular-whitespace */
        const normalized = `[normalize-space(translate(., ' ', '')) = ${formatted}]`
        /* eslint-enable no-irregular-whitespace */
        return this.elementIdElement(element.value.ELEMENT, `./option${normalized}|./optgroup/option${normalized}`)
    }).then(element => {
        /**
         * check if element was found and throw error if not
         */
        if (!element.value) {
            throw new Error(`No such element: "${selector}"`)
        }

        /**
         * select option
         */
        return this.elementIdClick(element.value.ELEMENT)
    })
}
