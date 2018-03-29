const assert = require('assert')

describe('My awesome feature', () => {
    it('should can do something', () => {
        browser.url('http://google.com')

        const title = browser.getTitle()
        assert.equal(title, 'Google')

        console.log('This is test 5 with result:', title) // eslint-disable-line
        browser.pause(4500)
    })
})
