// Debounce a function just enough so it runs in the next tick.
const soon
    = f => {
        let handle
        return (...x) => {
            clearTimeout(handle)
            handle = setTimeout(_ => f(...x), 0)
        }
    }

module.exports = soon
