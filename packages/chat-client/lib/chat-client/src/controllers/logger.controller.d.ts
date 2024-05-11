/**
 * LoggerController class that provides logging functionality.
 */
export declare class LoggerController {
    private pDebug;
    private pWarn;
    private pError;
    private pTrace;
    constructor();
    /**
     * Get the debug console method.
     * @returns The debug console method.
     */
    get debug(): any;
    /**
     * Get the warn console method.
     * @returns The warn console method.
     */
    get warn(): any;
    /**
     * Get the error console method.
     * @returns The error console method.
     */
    get error(): any;
    /**
     * Get the trace console method.
     * @returns The trace console method.
     */
    get trace(): any;
}
