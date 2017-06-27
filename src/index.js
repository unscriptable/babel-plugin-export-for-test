// Babel plugin to export tests

const { nodeName } = require('./babelNode')
const { before, after, trace } = require('./effect')
const soon = require('./soon')
const {
    replaceWithDeclaration, removeInlineComments, hasInlineComment
} = require('./inlineComment')
const {
    hasPrefixComment, exportDeclaration, removePrefixComment
} = require('./prefixComment')

const { writeFileSync } = require('fs')

// const log = console.log

// TODO: verbose option
// TODO: allow other options to collect tests

module.exports
    = babel => {
        const isTestEnv = process.env.BABEL_ENV === 'test'
        const tests = {}
        const writeManifest = soon(writeJson(writeFileSync))
        const writeTests
            = (path, state) => {
                const filename = state.opts.manifest || 'test_manifest.json'
                writeManifest(filename, tests)
            }
        const collectTests = collectTestNames(tests)
        const collect = isTestEnv ? trace(collectTests, writeTests) : x => x

        const visitor
            = Object.assign(
                {},
                visitorToSkipLowerLevels(),
                visitorForInlineComment(collect, babel, isTestEnv),
                visitorForPrefixComment(collect, babel, isTestEnv)
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

// Inline export comment: `export /* for test */`

// Create visitor
const visitorForInlineComment
    = (log, babel, isTestEnv) => {
        const op
            = isTestEnv
                ? removeInlineComments
                : before(replaceWithDeclaration, removeInlineComments)
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasInlineComment(path) && loggedOp(path, state)

        return { ExportNamedDeclaration: visit }
    }

// Prefix export comment: `/* export for test */`

// Create visitor
const visitorForPrefixComment
    = (log, { types }, isTestEnv) => {
        const fastExport
            = trace(
                exportDeclaration(types.exportNamedDeclaration),
                skip
            )
        const op
            = isTestEnv
                ? before(fastExport, removePrefixComment(types.removeComments))
                : removePrefixComment(types.removeComments)
        const loggedOp = before(op, log)
        const visit
            = (path, state) => hasPrefixComment(path) && loggedOp(path, state)

        return { Declaration: visit }
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

// const linesApart
//     = (loc1, loc2) => Math.abs(loc1.start.line - loc2.start.line)

const skip = path => path.skip()
