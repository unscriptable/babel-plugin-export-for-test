// Inline export comment: `export /* for test */`

const replaceWithDeclaration
    = path => path.replaceWith(path.node.declaration)

// TODO: try this: types.removeComments(path.node)
const removeInlineComments
    = ({ node }) => {
        // delete node.innerComments
        const declaration = node && node.declaration
        delete declaration.leadingComments
    }

const hasInlineComment
    = ({ node }) => {
        const comments
            = node && node.declaration && node.declaration.leadingComments
        return Array.isArray(comments) && isInlineComment(comments[0])
    }

exports.replaceWithDeclaration = replaceWithDeclaration
exports.removeInlineComments = removeInlineComments
exports.hasInlineComment = hasInlineComment

const isInlineComment
    = comment =>
        comment
        && comment.value
        && !!comment.value.match(/^\s*for\s+test\s*$/)
