/**
 * Returns a promise that resolves after the current task
 * has completed its work, and no other code is waiting to be run.
 *
 * Used to ensure consistent code execution order.
 */
export function yieldMicrotask(): Promise<void> {
    return new Promise<void>((resolve)=>{
        queueMicrotask(resolve)
    })
}

/**
 * Wait for `ms` milliseconds
 *
 */
export const snooze = (ms = 16) => new Promise((resolve) => setTimeout(resolve, ms));
