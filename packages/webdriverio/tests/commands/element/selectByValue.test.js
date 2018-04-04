import request from 'request'
import { remote } from '../../../src'

describe('selectByValue test', () => {
    let browser
    let elem

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('some-elem-123')
    })

    it('should select by value', async () => {
        await elem.selectByValue('someValue1')

        expect(request.mock.calls[1][0].uri.path).toBe('/wd/hub/session/foobar-123/element')
        expect(request.mock.calls[2][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/element')
        expect(request.mock.calls[3][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-sub-elem-321/click')
    })
})
