describe('lol', () => {
    it('lala', () => {
        return browser.url('https://serverless.com/').then(
            () => browser.getTitle().then(console.log))
    })
})
