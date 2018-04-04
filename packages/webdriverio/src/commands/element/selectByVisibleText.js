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
 * @alias element.selectByVisibleText
 * @param {String} text       text of option element to get selected
 * @uses protocol/findElementsFromElement, protocol/elementClick
 * @type action
 *
 */

export default async function selectByVisibleText (text) {
    /**
    * find option elem using xpath
    */
    let formatted = `"${text.trim()}"`

    if (/"/.test(text)) {
        // escape quotes
        formatted = 'concat("' + text.trim().split('"').join('", \'"\', "') + '")'
    }

    const normalized = `[normalize-space(translate(., ' ', '')) = ${formatted}]`
    const optionElement = await this.findElementFromElement(this.elementId, 'xpath', `./option${normalized}|./optgroup/option${normalized}`)

    /**
    * select option
    */
    return await this.elementClick(Object.values(optionElement)[0])
}
