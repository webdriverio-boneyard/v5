WebdriverIO Screenshots Cleanup Service
=======================================

> A WebdriverIO service to cleanup screenshots before tests run.

## Installation

The easiest way is to keep `wdio-screenshots-cleanup-service` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-screenshots-cleanup-service": "~0.0.7"
  }
}
```

You can simple do it by:

```bash
npm install wdio-screenshots-cleanup-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Usage

```js
// wdio.conf.js
export.config = {
  // ...
  services: ['screenshots-cleanup'],
  // clean screenshots
  cleanScreenshotsFolder: {
    folder: 'screenshots',
    pattern: '/**/ERROR_*'
  },
  // ...
};
```

Where:
  - `folder` is absolute or relative path to your project screenshots folder
  - `pattern` is optional property to tell `wdio-screenshots-clenup-service` what pattern to apply before deleting screenshots

## Development

All commands can be found in the package.json. The most important are:

Build package:

```sh
$ npm run build
```

----

For more information on WebdriverIO see the [homepage](http://webdriver.io).
