import fs from 'fs'
import tmp from 'tmp'
import path from 'path'
import shell from 'shelljs'
import EventEmitter from 'events'
import findNodeModules from 'find-node-modules'

import logger from 'wdio-logger'
import { DEFAULT_CONFIG } from './constants'

const log = logger('wdio-lambda-runner')

export default class AWSLambdaRunner extends EventEmitter {
    constructor (configFile, config, capabilities, specs) {
        super()

        const { AWS_ACCESS_KEY, AWS_ACCESS_KEY_ID } = process.env
        if (!AWS_ACCESS_KEY || !AWS_ACCESS_KEY_ID) {
            throw new Error('Please provide AWS_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_BUCKET in your environment')
        }

        this.instances = []
        this.configFile = configFile
        this.config = config
        this.capabilities = capabilities
        this.specs = specs
        this.nodeModulesDir = path.resolve(findNodeModules()[0])

        this.pwd = shell.pwd().stdout
        this.serverlessBinPath = path.resolve(require.resolve('serverless'), '..', '..', 'bin', 'serverless')
    }

    async initialise () {
        /**
         * generate temp dir for AWS service
         */
        this.serviceDir = tmp.dirSync({
            prefix: '.wdio-runner-service',
            dir: process.cwd(),
            mode: '0750'
        })

        log.info('Generating temporary AWS Lamdba service directory at %s', this.serviceDir.name)

        /**
         * link node_modules
         */
        this.link(this.nodeModulesDir, path.resolve(this.serviceDir.name, 'node_modules'))

        /**
         * link wdio config
         */
        this.link(
            path.resolve(process.cwd(), this.configFile),
            path.resolve(this.serviceDir.name, this.configFile)
        )

        /**
         * link specs
         */
        this.specs.forEach((spec) => {
            this.link(spec, path.join(this.serviceDir.name, spec.replace(process.cwd(), '')))
        })

        /**
         * create config
         */
        const runnerConfig = Object.assign(DEFAULT_CONFIG, {
            environment: {},
            package: {
                include: [],
                exclude: []
            }
        })

        /**
         * copy over files
         */
        shell.cp(path.resolve(__dirname, '..', 'config', 'serverless.yml'), path.resolve(this.serviceDir.name, 'serverless.yml'))
        shell.cp(path.resolve(__dirname, 'handler.js'), path.resolve(this.serviceDir.name, 'handler.js'))
        fs.writeFileSync(path.resolve(this.serviceDir.name, 'runner-config.json'), JSON.stringify(runnerConfig, null, 4))

        shell.cd(this.serviceDir.name)
        await this.exec(`${this.serverlessBinPath} deploy --verbose`)
        shell.cd(this.pwd)
    }

    /**
     * kill all instances that were started
     */
    kill () {
    }

    async run (options) {
        shell.cd(this.serviceDir.name)
        await this.exec(`${this.serverlessBinPath} invoke -f run --data '${JSON.stringify(options)}' --verbose`)
        shell.cd(this.pwd)
    }

    link (source, dest) {
        log.debug('Linking: ', source, dest)
        fs.symlinkSync(source, dest)
    }

    exec (script) {
        log.debug(`Run script "${script}"`)
        return new Promise((resolve, reject) => {
            const child = shell.exec(script, { async: true, silent: true })
            child.stdout.on('data', (stdout) => log.debug(stdout.trim().replace(/^Serverless: /, '')))
            child.stderr.on('data', ::log.error)
            child.on('close', (code) => {
                if (code === 0) {
                    return resolve()
                }

                reject(new Error(`script failed with exit code ${code}`))
            })
        })
    }
}
