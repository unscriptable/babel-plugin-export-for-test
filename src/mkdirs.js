//@flow
// Functions to recursively create a directory.

/*::
type Split = string => Array<string>
type Join = (...x:Array<string>) => string
*/

const mkdirs
    = exports.mkdirs
    = (mkdirSync/*:Function*/, split/*:Split*/, join/*:Join*/) => {
        const mkdir = ensureDir(mkdirSync)
        return (dir/*:string*/) =>
            split(dir).reduce((prev, seg) => mkdir(join(prev, seg)), '')
    }

const ensureDir
    = mkdirSync => path => {
        try {
            mkdirSync(path)
        }
        catch (err) {
            if (err.code !== "EEXIST") {
                throw err
            }
        }
        return path
    }
