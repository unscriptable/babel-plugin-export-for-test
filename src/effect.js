// Functions for executing side effects.

// Execute a side effect before each time another function runs.
// The advice receives the same arguments as the function.
const before
    = (f, effect) => (...x) => {
        effect(...x)
        return f(...x)
    }

// Execute a side effect after each time another function runs.
// The advice receives the function's result.
const after
    = (f, effect) => (...x) => {
        const result = f(...x)
        effect(result)
        return result
    }

// Execute a side effect after each time another function runs.
// The advice receives the same arguments as the function as well as its result.
const trace
    = (f, effect) => (...x) => {
        const result = f(...x)
        effect(...x.concat(result))
        return result
    }

exports.before = before
exports.after = after
exports.trace = trace
