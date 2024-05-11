"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerController = void 0;
// This class defines the logger controller.
/**
 * LoggerController class that provides logging functionality.
 */
class LoggerController {
    // The constructor of the logger controller.
    constructor() {
        // Private properties that store the console methods for debug, warn, error, and trace.
        this.pDebug = console.info.bind(console);
        this.pWarn = console.warn.bind(console);
        this.pError = console.error.bind(console);
        this.pTrace = console.trace.bind(console);
        // This block of code is commented out because it is not necessary.
        // this.pDebug.log = console.info.bind(console);
        // this.pWarn.log = console.warn.bind(console);
        // this.pError.log = console.error.bind(console);
        // this.pTrace.log = console.trace.bind(console);
        // this.pDebug.color = 'blue';
        // this.pWarn.color = 'yellow';
        // this.pError.color = 'red';
        // this.pTrace.color = 'pink';
    }
    // Getters that return the private properties.
    /**
     * Get the debug console method.
     * @returns The debug console method.
     */
    get debug() {
        return this.pDebug;
    }
    /**
     * Get the warn console method.
     * @returns The warn console method.
     */
    get warn() {
        return this.pWarn;
    }
    /**
     * Get the error console method.
     * @returns The error console method.
     */
    get error() {
        return this.pError;
    }
    /**
     * Get the trace console method.
     * @returns The trace console method.
     */
    get trace() {
        return this.pTrace;
    }
}
exports.LoggerController = LoggerController;
//# sourceMappingURL=logger.controller.js.map