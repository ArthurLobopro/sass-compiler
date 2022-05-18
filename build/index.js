const { copy } = require('./copy')
const generatePackage = require('./package')
const fs = require('fs')
const path = require('path')
const copyDir = require('copydirectory')

const baseDir = path.resolve(__dirname, '../')
const npmDir = path.resolve(baseDir, "npm")

const copyList = [
    {
        input: path.resolve(baseDir, "README.md"),
        out: path.resolve(npmDir, "README.md"),
        isFile: true
    }
]

if (!fs.existsSync(npmDir)) {
    fs.mkdirSync(npmDir)
}

copyList.forEach(({ input, isFile, out }) => isFile ? copy(input, out) : copyDir(input, out))
fs.writeFileSync(path.resolve(npmDir, "package.json"), generatePackage());