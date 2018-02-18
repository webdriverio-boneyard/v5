describe('lol', () => {
    it('lala', () => {
        return browser.url('http://saucelabs.com').then(
            () => browser.getTitle().then(console.log))
    })
})
