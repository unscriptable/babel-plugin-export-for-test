# babel-plugin-export-for-test

> **TODO: TOC**

## What is babel-plugin-export-for-test?

babel-plugin-export-for-test is a babel plugin that will either export all
functions marked "for test" or effectively hide them.  In theory, this plugin
will also export or hide classes or other exportable values that are marked "for
test", but this has not yet been tested.  In a future version, it will also
import modules that are marked "for test".

## Why create it?

(a.k.a. "The history of why John hates JavaScript unit tests.")

I've been actively writing JavaScript since 1996.  All this time, I've struggled
to force myself to slog through the tedium of writing unit tests.  They should
be way easier -- and more fun -- to create and maintain.

One way to make unit tests easier is to co-locate them alongside your JavaScript
module.  I've tried flavors of this for several years with limited success. Most
of the popular tools make it hard to interleave your tests with your production
code.  The more that JavaScript becomes a *compiled* language, the easier it
has become to co-locate unit tests.

However...

While working in some other languages, such as Haskell, I've come to appreciate
the ease at which I was able to write "doc tests".  Doc tests reside *inside*
the same module as the functions they test.  This seems like the holy grail of
unit testing: there's no need to export private functions just so you can test
them.  And maintenance is braindead obvious since the tests are *right there*.

Then I was introduced to Clojure.

Clojure elevates tests to *first class* via the
[`deftest`](https://clojuredocs.org/clojure.test/deftest) keyword.  Clojure
environments inherently know tests from production code.  You can (and should!)
write your tests right alongside your production functions.  This got me
thinking: why shouldn't all languages do this?  Why can't we do this in
JavaScript?

> This plugin is an attempt to pretend that tests are *first class* in
JavaScript.

I'd love it if this plugin got some attention and turned into an actual proposal
to EcmaScript.  I plan to use the plugin on my production code to see how much I
like it.  If you feel as I do -- that JavaScript needs first class tests -- then
I encourage you to try it, too.

## How it works

### Babel plugin

If you're not familiar with babel, start [here](https://babeljs.io).

This project is a babel plugin, so it hooks into the AST that babel creates,
watching for functions, classes, or other types of values that should be
exported for testing purposes.  When it encounters these values, it either
modifies the AST to export them or hide them, depending on the babel environment
(`BABEL_ENV` env var).

### Not an EcmaScript extension (yet)

Unfortunately, it's impossible to augment the JavaScript language unless you fork babel's AST parser, [babylon](https://github.com/babel/babylon).  Instead,
babel-plugin-export-for-test looks for comments that *look like* a possible extension to the language.

Some examples:

```js
// Another function we want to test:
export const add = (a, b) => a + b

// A test for our add function:
/* export for test */ const test_add
    = assert => {
        assert.strictEqual(add(3, 4), 7)
        assert.strictEqual(add(3, -4), -1)
        assert.strictEqual(add(0, 0), 0) // lame tests, I know
    }

// Another function we want to test (note: it doesn't need to be exported!):
const divide = (a, b) => a / b

// A test for our add function (note: no specific naming convention):
/* export for test*/ const does_divide_work
    = assert => {
        assert.strictEqual(divide(6, 2), 3)
        assert.strictEqual(divide(8, 4), 2) // can haz property tests?
    }

// Another test function that imports a test library:
import /*for test*/ { describe, it, assert } from 'my-fave-test-lib'
export /*for test*/ const anotherTest
    = () => {
        describe('my module', () => {
            it('should have tests', () => {
                assert(false) // this is always my first test!
            })
        })
    }
```

## How to use it

> **TODO**

## FAQ

### Does babel-plugin-export-for-test rely on a specific test framework?

No.  You may choose your own framework.  babel-plugin-export-for-test only
exports your tests.  It's up to you to ensure that the tests are found by your
favorite testing tools.  (By the time you read this, hopefully somebody has
already done the work to show how your favorite testing tools can be made to
work with babel-plugin-export-for-test.)

### Does babel-plugin-export-for-test rely on node's `assert` module?

Nope.  That's just the simplest way to show examples.

### Must I inject my testing tools (assertion library, etc) into my tests?

No, you don't have to do it this way, but it's highly recommended.  You can
either do an `import /*for test*/` (coming soon) or you can `require` your
testing tools inside your test functions (ugly workaround).

### Do I have to export the functions I want to test?

Nope.  See the examples!

### Should I use `/*export for test*/` or `export /*for test*/`?

It's your choice; either will work.  I like that `export /*for test*/` looks and
feels more like it's part of the language and it mirrors the proposed `import
/*for test*/` syntax, too.  However, `/*export for test*/` is strictly safer
since it's harder for exported tests to leak into production by accident.

### What would it be like if `export for test` were accepted into EcmaScript?

> TODO: show unicorns and rainbows and a few examples

### What are some of the alternatives to `export for test`?

> TODO: `deftest` keyword, `@test` annotation, co-located files, etc.
