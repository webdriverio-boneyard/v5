import request from 'request'
import { remote } from '../src'

describe('commands test', () => {
    let browser

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
    })

    it('should have a sessionId when instance was created', () => {
        expect(browser.sessionId).toBe('foobar-123')
        expect(request.mock.calls).toHaveLength(1)
        expect(request.mock.calls[0][0].method).toBe('POST')
        expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session')
    })

    describe('browser commands', () => {
        it('url', async () => {
            expect.assertions(4)

            await browser.url('http://google.com')
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/url')
            expect(request.mock.calls[0][0].body).toEqual({ url: 'http://google.com/' })
            await browser.url('/foobar')
            expect(request.mock.calls[1][0].body).toEqual({ url: 'http://foobar.com/foobar' })

            try {
                await browser.url(true)
            } catch (e) {
                expect(e.message).toContain('command needs to be type of string')
            }
        })

        describe('waitUntil', () => {
            it('Should throw an error if an invalid condition is used', async () => {  
                expect.assertions(1)  
                function waitUntil() {
                    browser.waitUntil('foo',500,'Timed Out',200)
                }

                await expect(waitUntil).toThrowError('Condition is not a function')
            })

            it('Should throw an error when the waitUntil times out', async () => {
                let error
                expect.assertions(1)
                try {
                    await browser.waitUntil(() => 
                        new Promise((resolve) => 
                            setTimeout(
                                () => resolve(false), 
                                200)),
                    500,'Timed Out',200)
                } catch(e) {
                    error = e
                } finally{
                    expect(error.message).toBe('Timed Out')
                }
            })

            it('Should throw an error when the promise is rejected', async () => {
                let error
                expect.assertions(1)
                try {
                    await browser.waitUntil(() => 
                        new Promise((resolve,reject) => 
                            setTimeout(
                                () => reject(new Error('foobar')), 
                                200,400)),
                    500,'Timed Out',200)
                } catch(e) {
                    error = e
                } finally{
                    expect(error.message).toBe('Promise was rejected with the following reason: Error: foobar')
                }
            })

            it('Should use default timeout setting from config if passed in value is not a number', async () => {
                let error
                expect.assertions(1)
                try {
                    await browser.waitUntil(() => 
                        new Promise((resolve) => 
                            setTimeout(
                                () => resolve(false), 
                                500)),
                    'blah','Timed Out',200)
                } catch(e) {
                    error = e
                } finally{
                    expect(error.message).toBe('Timed Out')
                }
            })

            it('Should use default interval setting from config if passed in value is not a number', async () => {
                let error
                expect.assertions(1)
                try {
                    await browser.waitUntil(() => 
                        new Promise((resolve) => 
                            setTimeout(
                                () => resolve(false), 
                                500)),
                    1000,'Timed Out','blah')
                } catch(e) {
                    error = e
                } finally{
                    expect(error.message).toBe('Timed Out')
                }
            })
            
            it('Should pass', async() => {
                let error
                expect.assertions(1)
                try {
                    await browser.waitUntil(() => 
                        new Promise((resolve) => 
                            setTimeout(
                                () => resolve(true), 
                                200)),
                    500,'Timed Out',200)
                } catch(e) {
                    error = e
                } finally{
                    expect(error).toBeUndefined()
                }
            })
        })
    })

    describe('element commands', () => {
        let elem

        beforeAll(async () => {
            elem = await browser.$('#foo')
        })

        it('should fetch an element', async () => {
            expect(request.mock.calls[0][0].method).toBe('POST')
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element')
            expect(request.mock.calls[0][0].body).toEqual({ using: 'id', value: 'foo' })
            expect(elem.elementId).toBe('some-elem-123')
        })

        it('should allow to click on an element', async () => {
            await elem.click()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/click')
        })

        it('should allow to get attribute from element', async () => {
            await elem.getAttribute('foo')
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/attribute/foo')
        })

        it('should allow to check if element is selected', async () => {
            await elem.isSelected()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/selected')
        })

        it('should allow to check if element is displayed', async () => {
            await elem.isDisplayed()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/displayed')
        })

        it('should allow to get the text of an element', async () => {
            await elem.getText()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/text')
        })

        it('should allow to clear an input element', async () => {
            await elem.clearElement()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/clear')
        })

        it('should allow to get the tag name of an element', async () => {
            await elem.getTagName()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/name')
        })

        it('should allow to check if an element is enabled', async () => {
            await elem.isEnabled()
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/enabled')
        })

        it('should allow to get the width and height of an element', async () => {
            const size = await elem.getElementSize()

            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/rect');
            expect(size.width).toBe(50)
            expect(size.height).toBe(30)
        })

        it('should allow to get the width of an element', async () => {
            const size = await elem.getElementSize('width')

            expect(size).toBe(50)
        })

        it('should allow to get the height of an element', async () => {
            const size = await elem.getElementSize('height')

            expect(size).toBe(30)
        })
    })

    describe('elements commands', () => {
        let elems

        beforeAll(async () => {
            elems = await browser.$$('.foo')
        })

        it('should fetch an element', async () => {
            expect(request.mock.calls[0][0].method).toBe('POST')
            expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/elements')
            expect(request.mock.calls[0][0].body).toEqual({ using: 'css selector', value: '.foo' })
            expect(elems).toHaveLength(3)

            expect(elems[0].elementId).toBe('some-elem-123')
            expect(elems[0].selector).toBe('.foo')
            expect(elems[0].index).toBe(0)
            expect(elems[1].elementId).toBe('some-elem-456')
            expect(elems[1].selector).toBe('.foo')
            expect(elems[1].index).toBe(1)
            expect(elems[2].elementId).toBe('some-elem-789')
            expect(elems[2].selector).toBe('.foo')
            expect(elems[2].index).toBe(2)
        })
    })

    afterEach(() => {
        request.mockClear()
    })
})
