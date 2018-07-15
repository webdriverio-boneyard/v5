import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'
import logger from 'wdio-logger'

const log = logger('wdio-screenshots-cleanup-service')

export default class WdioScreenshotsCleanupService {
  onPrepare (config) {
    return new Promise((resolve, reject) => {
      const options = config.cleanScreenshotsFolder

      const screenshotsFolder = path.isAbsolute(options.folder)
        ? options.folder
        : path.join(process.cwd(), options.folder)

      fs.exists(screenshotsFolder, exists => {
        if (exists) {
          if (options.pattern) {
            const pattern = options.pattern
            const dir = path.join(screenshotsFolder, pattern)
            rimraf(dir, err => {
              if (err) {
                log.error(`Failed to delete screenshots in folder: ${screenshotsFolder} using pattern ${pattern}`, err)
                return reject(err)
              }
            })
          } else {
            rimraf(screenshotsFolder, err => {
              if (err) {
                log.error(`Failed to delete screenshots folder: ${screenshotsFolder}`, err)
                return reject(err)
              }
            })
          }

          return resolve()
        }
      })

      resolve()
    })
  }
}
