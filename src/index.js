// Babel plugin to export tests

// var nodeName = require('./babelNode').nodeName

// const log = console.log

module.exports
    = babel => {
        const testEnv = process.env.BABEL_ENV === 'test'
        const collect = testEnv ? collectTests : x => x
        const visitor
            = Object.assign(
                {},
                visitorToSkipLowerLevels(),
                visitorForInlineComment(collect, babel, testEnv),
                visitorForPrefixComment(collect, babel, testEnv)
            )

        return { visitor }
    }

const collectTests
    = collection => (path, state) => {
console.log(state)
        const filename = '?'
        const testname = '?'
        const tests = collection[filename]
        if (!tests) tests = collection[filename] = []
        tests.push(testname)
    }

const before
    = (f, advice) => (...x) => {
        advice(...x)
        return f(...x)
    }

// Inline export comment: `export /* for test */`

// Create visitor
const visitorForInlineComment
    = (log, babel, testEnv) => {
        const op = testEnv ? replaceWithDeclaration : removeLeadingComments
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasInlineComment(path) && loggedOp(path, state)

        return { ExportNamedDeclaration: visit }
    }

const replaceWithDeclaration
    = path => path.replaceWith(declaration(path))

// TODO: try this: types.removeComments(path.node)
const removeLeadingComments
    = path => declaration(path).leadingComments = null

const hasInlineComment
    = path => {
        const comments = leadingComments(path)
        return comments != null && isInlineComment(last(comments))
    }

const isInlineComment
    = comment => comment && !!comment.matches(/\s*for\s+test\s*/)

const getNestedProperty
    = path => object =>
        getNnestedProperty(path.split('.'), object)

const _nestedProperty
    = (levels, object) => {
        return object && levels.length === 1
            ? object[levels[0]]
            : _nestedProperty(levels.slice(1), object)
    }

const declaration = getNestedProperty('node.declaration')
const leadingComments = getNestedProperty('node.declaration.leadingComments')
const bodyNodes = getNestedProperty('node.body.nodes')

// Prefix export comment: `/* export for test */`

// TODO: add visitor to skip non-top-level nodes

// Create visitor
const visitorForPrefixComment
    = (log, { types }, testEnv) => {
        const op
            = testEnv
                ? exportDeclaration(types.exportNamedDeclaration)
                : removeLeadingComments
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasPrefixComment(path) && loggedOp(path, state)

        return { Declaration: visit }
    }

const hasPrefixComment
    = path => {
        const comments = leadingComments(path)
        return comments != null && isPrefixComment(last(comments))
    }

const isPrefixComment
    = comment => comment && !!comment.matches(/\s*export\s*for\s+test\s*/)

const exportDeclaration
    = exportNamedDeclaration => path =>
        path.replaceWith(exportNamedDeclaration(path.node, []))

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

// const linesApart
//     = (loc1, loc2) => Math.abs(loc1.start.line - loc2.start.line)

const skip = path => path.skip()

const last = array => array[array.length - 1]
