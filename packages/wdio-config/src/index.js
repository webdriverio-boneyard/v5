import ConfigParser from './lib/ConfigParser'
import { validateConfig, detectBackend, initialisePlugin } from './utils'
import { runInFiberContext, wrapCommand, wrapCommands, executeHooksWithArgs } from './shim'

export default {
    validateConfig,
    detectBackend,
    initialisePlugin,
    ConfigParser,

    /**
     * wdio-sync shim
     */
    wrapCommand,
    wrapCommands,
    runInFiberContext,
    executeHooksWithArgs
}
