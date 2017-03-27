# How to export / define tests?

1. Annotation in a comment: @test
    - Test build: export function
    - Prod build: remove function
2. Export extension: `export test`
    - Test build: transform to `export const`
    - Prod build: remove export
    - Variations:
        - `export for test <function|named arrow>`
        - `export for test { <methods> }`
3. Naming convention: `const foo_test = (assert) => { assert(false) }`
    - Test build: export function
    - Prod build: remove function
4. Directive: `"export for test";`

## Annotation

Pros:

* Backwards-compatible
* Already have much of the know-how and some code

Cons:

* Chance of typos
* Potential conflict with other annotation-based packages
* Feels non-native

## Export extension

Pros:

* Feels like futuristic JavaScript
* Feels like clojure
* Tests are a first-class part of the language

Cons:

* Not backwards-compatible
* Need to decipher babylon plugins

## Naming convention

Pros:

* Backwards-compatible

Cons:

* Feels hacky
* Chance of false positives
* Chance of typos
