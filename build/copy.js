const fs = require('fs')
const path = require('path')

function copy(filePath, outPath) {
    if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, outPath)
    }
}

module.exports = { copy }