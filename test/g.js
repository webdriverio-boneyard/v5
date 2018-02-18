describe('lol', () => {
    it('lala', () => {
        return browser.url('http://iota.org').then(
            () => browser.getTitle().then(console.log))
    })
})
