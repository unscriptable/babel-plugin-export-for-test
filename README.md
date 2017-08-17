# babel-plugin-export-for-test

> **TODO: TOC**

## What is babel-plugin-export-for-test?

babel-plugin-export-for-test is a babel plugin that will either export all
functions marked "for test" or effectively hide them, depending on whether you
are compiling code to be tested or to be deployed to production.  In theory,
this plugin will also work with classes or other exportable values that are
marked "for test", but I haven't tried these, yet.  A future version will also
support *importing* modules that are marked "for test".

## Why create it?

### a.k.a. "The history of why John hates JavaScript unit tests."

I've been actively writing JavaScript since 1996.  All this time, I've struggled
to force myself to slog through the tedium of writing unit tests.  They should
be way easier -- and more fun -- to create and maintain.

One way to make unit tests easier is to co-locate them in the same directory as
your JavaScript modules.  I've tried flavors of this for several years with
limited success. Most of the popular tools make it hard to interleave your tests
with your production code.  The more that JavaScript becomes a *compiled*
language, however, the easier it has become to co-locate unit tests.

### Then I discovered doc tests.

While working in some other languages, such as Haskell, I've come to appreciate
the ease at which I was able to write [doc
tests](https://docs.python.org/3/library/doctest.html).  Doc tests reside
*inside* the same module as the functions they test.  This seemed like the holy
grail of unit testing: there's no need to export private functions just so you
can test them.  And maintenance is braindead obvious since the tests are *right
there*.

One problem with doc tests is that they aren't normally noticed by linters,
compilers, etc.  (You can get *some* linters and compilers to see them, but it
can get kinda hacky.)

### Then I was introduced to Clojure.

Clojure elevates tests to *first class* via the
[`deftest`](https://clojuredocs.org/clojure.test/deftest) keyword.  Clojure
environments inherently know tests from production code.  You can (and should!)
write your tests right alongside your production functions -- *i.e. in the same
file!*  This got me thinking: why shouldn't all languages do this?  Why can't we
do this in JavaScript?

> **In short: This plugin is an attempt to pretend that tests are *first class*
in JavaScript.**

I'd love it if this plugin got some attention and turned into an actual proposal
to EcmaScript 2018.  I've been using the plugin on my production code to see how
much I like it.  So far, I love it.  If you think that JavaScript needs first
class tests,  then I encourage you to try it, too.

## How it works

### Babel plugin

If you're not familiar with babel, start [here](https://babeljs.io).

This project is a babel plugin, so it hooks into the AST that babel creates,
watching for functions, classes, or other types of values that should be
exported for testing purposes.  When it encounters these values, it either
modifies the AST to export them or hide them, depending on the babel environment
(`BABEL_ENV` env var).

Values that are hidden should get removed from the code when you comile it for
production.  Some tools that do this well are [Rollup](https://rollupjs.org) or
[Webpack](https://webpack.js.org).

The plugin also creates a manifest.json file containing a mapping of all files
with tests to the names of the exported tests.  You can use this manifest to
help your test framework find the tests.

### Not an EcmaScript extension (yet)

Unfortunately, it's impossible to augment the JavaScript language unless you
fork babel's AST parser, [babylon](https://github.com/babel/babylon).  Instead,
babel-plugin-export-for-test looks for comments that *look like* a possible
extension to the language.

### Some examples

```js
// A function we want to test:
export const add = (a, b) => a + b

// A test for our exported add function:
/* export for test */
const test_add
    = assert => {
        assert.strictEqual(add(3, 4), 7)
        assert.strictEqual(add(3, -4), -1)
        assert.strictEqual(add(0, 0), 0) // lame tests, I know
    }

// Another function we want to test (note: it doesn't need to be exported!):
const divide = (a, b) => a / b

// A test for our *non-exported* divide function:
/* export for test*/
const does_divide_work
    = assert => {
        assert.strictEqual(divide(6, 2), 3)
        assert.strictEqual(divide(8, 4), 2) // can haz property tests?
    }

// Another test function that imports a test library:
// Note: `import` doesn't work, yet:
import /*for test*/ { describe, it, assert } from 'my-fave-test-lib'
export /*for test*/ const anotherTest
    = () => {
        describe('my module', () => {
            it('should have tests', () => {
                assert(false) // this is always my first test!
            })
        })
    }

// The same test function with test library injected.
// Injection is the preferred way:
export /*for test*/ const anotherTest
    = ({ describe, it, assert }) => {
        describe('my module', () => {
            it('should have tests', () => {
                assert(false) // this is always my first test!
            })
        })
    }
```

## How to use it

> **TODO**

> **TODO: show transformed code for testing and production**

> **TODO: show example using [tap](https://github.com/tapjs/node-tap)**

### More examples

> **TODO: show exported object with test methods**

> **TODO: show exported class with test methods**

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

You may also export an object literal whose properties are test functions.  Add
your testing tools as properties so you can refer to them using `this` from
within your functions.  You can also use a class and inject your testing tools
via the constructor.  (See the examples.)

### Do I have to export the functions I want to test?

Nope.  See the examples!

### Should I use `/*export for test*/` or `export /*for test*/`?

It's your choice; either will work.  I like that `export /*for test*/` looks and
feels more like it's part of the language and it mirrors the proposed `import
/*for test*/` syntax, too.  However, `/*export for test*/` is probably safer
since it's harder for exported tests to leak into production by accident.

### Can I use `/*export for testing*/` instead of `/*export for test*/`?

Some native English speakers might find that "for test" doesn't feel like
natural speech.  (Note: this is code, not English, folks!)
babel-plugin-export-for-test allows you to type `/*export for testing*/` or
`export /*for testing*/` instead, but I'm dubious that these versions will be
supported in future versions.  Feedback appreciated!

### What is my risk if `export for test` never becomes part of EcmaScript?

At worst, you have some legacy code that relies on this super simple babel
plugin.  If you find you need to migrate from babel -- or this plugin falls into
an unmaintained state some day -- it should be very easy for an intern (heh!) to
export all of your tested functions and then move your test functions into
standalone modules.

### What would it be like if `export for test` were accepted into EcmaScript?

> TODO: show unicorns and rainbows and a few examples

### What are some of the alternatives to the proposed `export for test` syntax?

> TODO: `deftest` keyword, `@test` annotation, etc.
