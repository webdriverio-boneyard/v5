describe('lol', () => {
    it('lala', () => {
        return browser.url('http://bild.de').then(
            () => browser.getTitle().then(console.log))
    })
})
