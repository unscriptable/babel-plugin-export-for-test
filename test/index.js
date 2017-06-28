//@flow
import { shim, runNode } from 'creed'

shim() // insal creed's promise implementation

import { join, basename } from 'path'
import glob from 'glob'
// TODO: use transformFile, not transformFileSync
import { transform, transformFileSync } from 'babel-core'
// TODO: use readFile, not readFileSync
import { readFile, readFileSync } from 'fs'
import assert from 'assert'

// TODO: test export and non-export transformations by using separate .babelrc
// file. See options, below.

// TODO: test manifest

// TODO: refactor this mess
const main
    = async ({ samplePath, testPattern, expectedPath }) => {
        const sourceTests = join(samplePath, testPattern)
        const filenames
            = await runNode(glob, sourceTests)
                .then(tap(failIfNoTests))
                .catch(failCantFindTests)
        const result
            = await Promise.all(
                filenames
                    // read sample and expected versions of file
                    .map(sName => [sName, join(expectedPath, basename(sName))])
                    // transform expected with our plugin
                    .map(
                        ([sName, eName]) => [
                            transformFileSync(sName, xformOptions).code,
                            String(readFileSync(eName)),
                            sName
                        ]
                    )
                    // parse asts
                    .map(
                        ([sSource, eSource, sName]) => [
                            transform(sSource, xformOptions).ast,
                            transform(eSource, xformOptions).ast,
                            sName
                        ]
                    )
                    // strip out minor differences
                    .map(
                        ([sAst, eAst, sName]) => [
                            stripSuperfluousDetails(sAst),
                            stripSuperfluousDetails(eAst),
                            sName
                        ]
                    )
                    // compare asts
                    .map(
                        ([sAst, eAst, sName]) =>
                            (assert.deepEqual(sAst, eAst), sName)
                    )
            )
        console.log(result)
        // console.log(parse(filenames[0]))
    }

// TODO: create separate options for code transform and AST generation
const xformOptions
    = {
        ast: true,
        code: true,
        sourceMaps: false,
        sourceType: 'module',
        babelrc: true,
        // extends: '.babelrc',
        comments: true
    }

const failIfNoTests
    = filenames => {
        if (!filenames || !(filenames.length > 0)) {
            throw new Error('Glob pattern didn\'t match any files.')
        }
    }

const failCantFindTests
    = (err) => {
        throw new Error(`Could not find tests: "${err.message}"`)
    }

const ignoredKeys = { start: true, end: true, loc: true }

const stripKey
    = key =>
        key in ignoredKeys || key.substring(0, 1) == '_'

const stripSuperfluousDetails
    = x => {
        if (Array.isArray(x)) {
            return x.map(stripSuperfluousDetails)
        }
        else if (x && typeof x === 'object') {
            return Object.keys(x).reduce(
                (obj, key) => {
                    if (!stripKey(key)) obj[key] = stripSuperfluousDetails(x[key])
                    return obj
                },
                {}
            )
        }
        else {
            return x
        }
    }


const tap = f => x => (f(x), x)

main({
    testPattern: '*.js',
    samplePath: 'test/sample',
    expectedPath: 'test/expected'
})
