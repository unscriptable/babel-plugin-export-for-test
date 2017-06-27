// TODO: isBlockComment, other babel-specific functions

// Extracts the name of a babel node object.
const nodeName
    = node => {
        switch (node.type) {
            case 'Identifier':
                return (node.name)
            case 'MemberExpression':
                return nodeName(node.object) + '.' + nodeName(node.property)
            case 'AssignmentExpression':
                return nodeName(node.left)
            case 'ExpressionStatement':
                return nodeName(node.expression)
            case 'ExportDefaultDeclaration':
            case 'ExportNamedDeclaration':
                return nodeName(node.declaration)
            case 'VariableDeclaration':
                return nodeName(node.declarations[0]) // VariableDeclarator
            case 'FunctionExpression':
            case 'ClassExpression':
                return node.id && node.id.name || '(anonymous)'
            case 'VariableDeclarator':
            case 'ClassDeclaration':
            case 'FunctionDeclaration':
                return node.id.name
            default:
                return '(unknown source node type)'
        }
    }

module.exports.nodeName = nodeName
