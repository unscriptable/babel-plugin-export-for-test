// Babel plugin to export tests

// var render = require('mustache').render

// var nodeName = require('./babelNode').nodeName
// var mochaTemplate = require('./template/mocha-file.mustache.js')

const log = console.log

/*
TODO: doc this

TODO: create a test runner / manifest. perhaps it's a module name
*/

module.exports
    = babel => {
        const processNode
            = process.env.BABEL_ENV === 'test' ? exportNode : removeNode
        return ({
            visitor: {
                Program: processProgram,
                Declaration: processNode(babel),
                // Performance optimizations:
                Function: skip
            }
        })
    }

const processProgram
    = (path, state) =>
        findExportsforTest(path.node.body || [])
            .forEach(node => node.__isExportForTest = true)

const exportNode
    = ({ types }) => (path, state) => {
        if (path.node.__isExportForTest) {
            // TODO: why doesn't this work?
            if (types.isExportNamedDeclaration(path.parentPath.node)) {
                throw path.buildCodeFrameError('Declaration declared as `export for test` is already exported')
            }
            path.node.__isExportForTest = false // prevent infintie loop
            path.replaceWith(types.exportNamedDeclaration(path.node, []))
        }
    }

const removeNode
    = ({ types }) => (path, state) => {
        if (path.node.__isExportForTest) {
            // TODO: why doesn't this work?
            types.removeComments(path.node)
            path.remove()
        }
    }
const findExportsforTest
    = nodes =>
        nodes.filter(hasExportForTestComment)

const hasExportForTestComment
    = node =>
        isIterable(node.leadingComments)
            && node.leadingComments.some(isExportforTestComment(node))

const isExportforTestComment
    = node => comment =>
        hasTestAnnotation(comment) && linesApart(comment.loc, node.loc) <= 1

const isIterable
    = a => a && a.length > 0 && typeof a.some === 'function'

const hasTestAnnotation
    = comment => comment.value.match(/export for test/)

const linesApart
    = (loc1, loc2) => Math.abs(loc1.start.line - loc2.start.line)

const skip = (path) => path.skip()
