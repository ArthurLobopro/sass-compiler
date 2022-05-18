import * as path from 'path'
import * as fs from "fs"

export interface IFormat {
    format: "compressed" | "expanded";
    extensionName: string;
    savePath?: string;
    savePathSegmentKeys?: string[];
    savePathReplaceSegmentsWith?: string;
    linefeed: "cr" | "crlf" | "lf" | "lfcr";
    indentType: "space" | "tab";
    indentWidth: number;
}

const configPath = path.resolve(process.cwd(), "sass-compiler.settings.js")

const defaultConfigs = {
    generateMap: false,
    autoPrefix: [],
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
    includeItems: null
}

export class Helper {

    private static get configSettings() {

        return fs.existsSync(configPath) ? require(configPath) : defaultConfigs
    }

    static getConfigSettings<T>(val: string): T {
        return this.configSettings[val] as T;
    }

}
