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


module.exports.clonePackage = function clonePackage() {
    const package_content = require('../../package.json')

    //Remove properties
    Object.keys(package_content).forEach(key => {
        if (propertiesToRemove.includes(key)) {
            delete package_content[key]
        }
    })

    //Add properties
    Object.keys(propertiesToAdd).forEach(key => package_content[key] = propertiesToAdd[key])

    return JSON.stringify(package_content, null, 4)
}