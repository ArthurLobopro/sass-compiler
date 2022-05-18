const propertiesToRemove = [
    "scripts",
    "devDependencies"
]

const propertiesToAdd = {
    "main": "src/cli.js",
    "bin": {
        "sass-compiler": "src/cli/cli.js"
    },
    "files": [
        "src/"
    ]
}


module.exports = function generatePackage() {
    const defaultConfig = require('../package.json')

    Object.keys(defaultConfig).forEach(key => {
        if (propertiesToRemove.includes(key)) {
            delete defaultConfig[key]
        }
    })

    Object.keys(propertiesToAdd).forEach(key => defaultConfig[key] = propertiesToAdd[key])

    return JSON.stringify(defaultConfig, null, 4)
}