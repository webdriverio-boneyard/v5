describe('lol', () => {
    it('lala', () => {
        return browser.url('http://saucecon.com').then(
            () => browser.getTitle().then(console.log))
    })
})
