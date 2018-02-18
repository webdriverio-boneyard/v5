describe('A', () => {
    it('test', () => {
        return browser.url('https://the-internet.herokuapp.com/').then(
            () => browser.getTitle().then(console.log))
    })
})
