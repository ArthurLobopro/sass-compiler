const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")
const { clonePackage } = require("./util/clone-package")

const root_dir = path.resolve(__dirname, '../')
const npmDir = path.resolve(root_dir, "npm")

//Make npm directory
console.log("Making npm directory...")

if (!fs.existsSync(npmDir)) {
    fs.mkdirSync(npmDir)
} else {
    fs.rmSync(npmDir, { recursive: true })
    fs.mkdirSync(npmDir)
}

//Transpile typescript
console.log("Transpiling typescript...")
execSync("yarn tsc")

//Copy package.json
console.log("Copying package.json...")
fs.writeFileSync(path.resolve(npmDir, "package.json"), clonePackage())

//Copy README.md
console.log("Copying README.md...")
fs.copyFileSync(path.resolve(root_dir, "README.md"), path.resolve(npmDir, "README.md"))