// Babel plugin to export tests

const nodeName = require('./babelNode').nodeName

const writeFileSync = require('fs').writeFileSync

// const log = console.log

// TODO: verbose option
// TODO: allow other options to collect tests

module.exports
    = babel => {
        const testEnv = process.env.BABEL_ENV === 'test'
        const tests = {}
        const writeManifest = soon(writeJson(writeFileSync))
        const writeTests
            = (path, state) => {
                const filename = state.opts.manifest || 'test_manifest.json'
                writeManifest(filename, tests)
            }
        const collectTests = collectTestNames(tests)
        const collect = testEnv ? trace(collectTests, writeTests) : x => x

        const visitor
            = Object.assign(
                {},
                visitorToSkipLowerLevels(),
                visitorForInlineComment(collect, babel, testEnv),
                visitorForPrefixComment(collect, babel, testEnv)
            )

        return { visitor }
    }

const collectTestNames
    = collection => (path, state) => {
        const filename = state.file.opts.filename
        const testname = nodeName(path.node)
        const tests = collection[filename] || (collection[filename] = [])
        tests.push(testname)
    }

const writeJson
    = write => (filename, thing) =>
        write(filename, JSON.stringify(thing))

const soon
    = f => {
        let handle
        return (...x) => {
            clearTimeout(handle)
            handle = setTimeout(_ => f(...x), 0)
        }
    }

const before
    = (f, advice) => (...x) => {
        advice(...x)
        return f(...x)
    }

const after
    = (f, advice) => (...x) => {
        const result = f(...x)
        advice(result)
        return result
    }

const trace
    = (f, advice) => (...x) => {
        const result = f(...x)
        advice(...x.concat(result))
        return result
    }

// Inline export comment: `export /* for test */`

// Create visitor
const visitorForInlineComment
    = (log, babel, testEnv) => {
        const op
            = testEnv
                ? removeLeadingComments
                : before(replaceWithDeclaration, removeLeadingComments)
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasInlineComment(path) && loggedOp(path, state)

        return { ExportNamedDeclaration: visit }
    }

const replaceWithDeclaration
    = path => path.replaceWith(declaration(path))

// TODO: try this: types.removeComments(path.node)
const removeLeadingComments
    = path => {
        path.node.innerComments = null
        declaration(path).leadingComments = null
    }

const hasInlineComment
    = path => {
        const comments = leadingComments1(path)
        return Array.isArray(comments) && isInlineComment(last(comments))
    }

const isInlineComment
    = comment =>
        comment
        && comment.value
        && !!comment.value.match(/^\s*for\s+test\s*$/)

const getNestedProperty
    = path => object =>
        _nestedProperty(path.split('.'), object)

const _nestedProperty
    = (levels, object) => {
        return levels.length === 0 || typeof object !== 'object'
            ? object
            : _nestedProperty(levels.slice(1), object[levels[0]])
    }

const declaration = getNestedProperty('node.declaration')
const leadingComments1 = getNestedProperty('node.declaration.leadingComments')
const leadingComments2 = getNestedProperty('node.leadingComments')
const bodyNodes = getNestedProperty('node.body.nodes')

// Prefix export comment: `/* export for test */`

// TODO: add visitor to skip non-top-level nodes

// Create visitor
const visitorForPrefixComment
    = (log, { types }, testEnv) => {
        const skipChildren = path => path.skip()
        const exportAndSkip
            = trace(
                exportDeclaration(types.exportNamedDeclaration),
                skipChildren
            )
        const op
            = testEnv
                ? before(exportAndSkip, removeLeadingComments2(types.removeComments))
                : removeLeadingComments2(types.removeComments)
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasPrefixComment(path) && loggedOp(path, state)

        return { Declaration: visit }
    }

const hasPrefixComment
    = path => {
        const comments = leadingComments2(path)
        return Array.isArray(comments) && isPrefixComment(last(comments))
    }

const isPrefixComment
    = comment =>
        comment
        && comment.value
        && !!comment.value.match(/^\s*export\s*for\s+test\s*$/)

const exportDeclaration
    = exportNamedDeclaration => path =>
        path.replaceWith(exportNamedDeclaration(path.node, []))

const removeLeadingComments2
    = remove => path => {
// console.log('removeLeadingComments2', path.node.leadingComments)
        // TODO: Why doesn't this work?
        remove(path.node)
        // const prev = path.getSibling(path.key)
        // if (prev) {
        //     remove(prev)
        //     delete prev.trailingComments
        // }
        // const comments = path.node.leadingComments
        // path.node.leadingComments
        //     = comments.length > 1 ? comments.slice(0, -1) : null
// console.log('removeLeadingComments2', path.node.leadingComments)
    }

// TODO: throw if already exported:
    // if (types.isExportNamedDeclaration(path.parentPath.node)) {
    //     throw path.buildCodeFrameError('Declaration declared as `export for test` is already exported')
    // }

// Performance optimizations

// Create visitor
const visitorToSkipLowerLevels
    = _ => ({
        Function: skip,
        Class: skip
    })

// Helpers

const linesApart
    = (loc1, loc2) => Math.abs(loc1.start.line - loc2.start.line)

const skip = path => path.skip()

const last = array => array[array.length - 1]
