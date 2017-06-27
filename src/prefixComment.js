// Prefix export comment: `/* export for test */`

const hasPrefixComment
    = ({ node }) => {
        const comments = node.leadingComments
        return Array.isArray(comments) && isPrefixComment(last(comments))
    }

const exportDeclaration
    = exportNamedDeclaration => path =>
        path.replaceWith(exportNamedDeclaration(path.node, []))

const removePrefixComment
    = remove => path => {
        // TODO: Why doesn't any of this work?
        remove(path.node)
        // const prev = path.getSibling(path.key)
        // if (prev) {
        //     remove(prev)
        //     delete prev.trailingComments
        // }
        // const comments = path.node.leadingComments
        // path.node.leadingComments
        //     = comments.length > 1 ? comments.slice(0, -1) : null
    }

exports.hasPrefixComment = hasPrefixComment
exports.exportDeclaration = exportDeclaration
exports.removePrefixComment = removePrefixComment

const isPrefixComment
    = comment =>
        comment
        && comment.value
        && !!comment.value.match(/^\s*export\s*for\s+test\s*$/)

const last = array => array[array.length - 1]
