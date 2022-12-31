import { writeFileSync } from "fs"
import { resolve } from "path"
import { App } from "../app/App"

const app = new App()

export function init() {
    const filename = resolve(process.cwd(), "sass-compiler.config.js")
    const content = `module.exports = {
        generateMap: false,
        formats: [
            {
                format: "compressed",
                extensionName: ".css",
                savePath: null
            }
        ],
        excludeList: [
            "**/node_modules/**",
            ".vscode/**"
        ],
        includeItems: null,
        autoprefix: ['> 1%', 'last 2 versions']
    }`
    writeFileSync(filename, content)
}

export function compile() {
    app.compileAllFiles()
}

export function watch() {
    app.watch()
    console.log("Watching files...")
    console.log("Press Ctrl + C to stop watching.")
}