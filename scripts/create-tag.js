const { execSync } = require("child_process")

const { version } = require("../package.json")

execSync(`git tag v${version}`)
execSync(`git push`)