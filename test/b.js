describe('root suite', () => {
    it('passing test', () => {
        console.log(444, browser.url.toString())
        browser.url('http://json.org')
        console.log(12, browser.getTitle())
        // const a = $$('img')
        // console.log(a)
        // console.log(a.getTagName());
    })

    // it.skip('skipped test')
    //
    // describe('nested suite', () => {
    //     beforeEach(() => {
    //         console.log('lol');
    //     })
    //
    //     it('failing test', () => {
    //         throw new Error('some error')
    //     })
    //
    //     it('empty test', () => {
    //         console.log('IAMEMPTY');
    //     })
    // })
})
