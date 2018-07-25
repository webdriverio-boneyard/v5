import request from 'request'
import { remote } from '../../../src'

describe('isVisible test', () => {
    let browser
    let elem

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('#foo')
    })

    it('should allow to check if element is visible', async () => {
        await elem.isVisible()
        expect(request.mock.calls[2][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/displayed')
    })

    afterEach(() => {
        request.mockClear()
    })
})
