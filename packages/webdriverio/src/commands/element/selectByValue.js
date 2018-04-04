/**
 *
 * Select option with a specific value.
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
    :selectByValue.js
    it('Should demonstrate the selectByValue command', function () {
        const selectBox = $('#selectbox');
        console.log(selectBox.getValue()); // returns "someValue0"
        selectBox.selectByValue('someValue3');
        console.log(selectBox.getValue()); // returns "someValue3"
    });
 * </example>
 *
 * @alias element.selectByValue
 * @param {String} value      value of option element to get selected
 * @uses protocol/findElementFromElement, protocol/elementClick
 * @type action
 *
 */

export default function selectByValue (value) {
    return this.selectByAttribute('value', value)
}


