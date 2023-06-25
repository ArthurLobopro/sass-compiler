import * as fs from "fs"
import * as path from 'path'

export interface IFormat {
    format: "compressed" | "expanded"
    extensionName: string
}

const configPath = path.resolve(process.cwd(), "sass-compiler.config.js")

const defaultConfigs = {
    generateMap: false,
    autoprefix: ["> 1%", "last 2 versions"],
    formats: [
        {
            format: "compressed",
            extensionName: ".css"
        }
    ],
    excludeList: [
        "**/node_modules/**",
        ".vscode/**"
    ],
    includeItems: null
}

export class Helper {
    private static get configSettings() {
        const config_file_exists = fs.existsSync(configPath)
        if (config_file_exists) {
            const config = require(configPath)
            return config
        }
        return defaultConfigs
    }

    static getConfigSettings<T>(val: string): T {
        return this.configSettings[val] as T
    }
}
