module.exports = `// This file is auto-generated. Edits may be overwritten.
import { describe, it } from 'mocha'
import { deepStrictEqual } from 'assert'

import * from '{{& pathToSrcModule }}'

describe('{{& filename }}', () => {
    {{# tests }}
    describe('{{& node }}', () => {
        it('{{& description }}', () => {
            {{# assertions }}
            {{# firstLines }}
            {{& . }}
            {{/ firstLines }}
            const actual = {{& lastLine }}
            const expected = "{{# expects }}{{& . }}{{/ expects }}"
            assert.deepStrictEqual(actual, expected)
            {{/ assertions }}
        })
    })
    {{/ tests }}
})
`
