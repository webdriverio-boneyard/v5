WebdriverIO Applitools Service
==============================

> A WebdriverIO service for visual regression testing using Applitools

## Configuration

In order to use the service you need to set `applitoolsKey` in your `wdio.conf.js` config file or have `APPLITOOLS_KEY` stored in your environment so that it can access the Applitools API. Also make sure that you added `applitools` to your service list, e.g.

```js
// wdio.conf.js
export.config = {
  // ...
  services: ['applitools'],
  applitools: {
    // options
    // ...
  }
  // ...
};
```

## Usage

Once the service is added you just need to call the `browser.check` command to compare images within the badge. The command takes a screenshot name so Applitools can compare it always with the correct image from the baseline, e.g.

```js
describe('My Google Search', () => {
    it('should open the page', () => {
        browser.url('http://google.com')
        browser.check('main page')
    })

    it('should search for something', () => {
        $('#lst-ib').addValue('WebdriverIO ❤️  Applitools')
        browser.keys('Enter')
        browser.check('search')
    })
})
```

On the Applitools dashboard you should now find the test with two images:

![Applitools Dashboard](/packages/wdio-applitools-service/docs/dashboard.png "Applitools Dashboard")

## Options

### viewport
Viewport with which the screenshots should be taken.

Type: `Object`<br>
Default: `{'width': 1440, 'height': 900}`
