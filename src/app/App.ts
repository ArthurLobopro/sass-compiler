'use strict'

import * as path from 'path'
import glob from 'glob'

import { FileHelper, IFileResolver } from './FileHelper'
import { SassHelper } from './SassCompileHelper'
import { Helper, IFormat } from './helper'
import { showError, delay } from './Util'
import { watchFile } from 'fs'
import { Options } from 'sass'

import autoprefixer from "autoprefixer"
import BrowserslistError from "browserslist/error"
// import fs from "fs";
// import picomatch from "picomatch";
import postcss from "postcss"

export class App {

    isWatching: boolean

    constructor() {
        this.isWatching = false
    }

    static get basePath(): string {
        return process.cwd() //|| path.basename(vscode.window.activeTextEditor.document.fileName);
    }

    /**
     * Compile All scss files with watch mode.
     * 
     */
    compileAllFiles() {
        this.GenerateAllCssAndMap()
    }

    // async compileOnSave() {
    //     if (!this.isWatching) return;

    //     let currentFile = vscode.window.activeTextEditor.document.fileName;
    //     if (!this.isASassFile(currentFile, true)) return;
    //     // if (!(await this.isSassFileIncluded(fileUri, '**/*.s[a|c]ss'))) return;


    //     if (!this.isASassFile(currentFile)) { // Partial Or not
    //         await this.GenerateAllCssAndMap()
    //     }
    //     else {
    //         let formats = Helper.getConfigSettings<IFormat[]>('formats');
    //         let sassPath = currentFile;
    //         formats.forEach(format => { // Each format
    //             let options = this.getCssStyle(format.format);
    //             let cssMapPath = this.generateCssAndMapUri(sassPath, format.savePath, format.extensionName);
    //             this.GenerateCssAndMap(sassPath, cssMapPath.css, cssMapPath.map, options)
    //                 .then(() => {

    //                 });
    //         });
    //     }

    // }


    async isSassFileIncluded(sassPath: string, queryPatten = '**/[^_]*.s[a|c]ss') {
        let files = await this.getSassFiles(queryPatten)
        return files.find(e => e === sassPath) ? true : false
    }

    isASassFile(pathUrl: string, partialSass = false): boolean {
        const filename = path.basename(pathUrl)
        return (partialSass || !filename.startsWith('_')) && (filename.endsWith('sass') || filename.endsWith('scss'))
    }

    //@ts-ignore
    getSassFiles(queryPatten = '**/[^_]*.s[a|c]ss'): Thenable<string[]> {
        let excludedList = Helper.getConfigSettings<string[]>('excludeList')
        let includeItems = Helper.getConfigSettings<string[] | null>('includeItems')

        let options = {
            ignore: excludedList,
            mark: true,
            cwd: App.basePath
        }

        if (includeItems && includeItems.length) {
            if (includeItems.length === 1) {
                queryPatten = includeItems[0]
            }
            else {
                queryPatten = `{${includeItems.join(',')}}`
            }
        }

        return new Promise(resolve => {
            glob(queryPatten, options, (err, files: string[]) => {
                if (err) {
                    resolve([])
                    return
                }
                const filePaths = files
                    .filter(file => this.isASassFile(file))
                    .map(file => path.join(App.basePath, file))
                return resolve(filePaths || [])
            })
        })
    }

    private findAllSaasFilesAsync(callback) {
        this.getSassFiles().then(files => callback(files))
    }

    /**
     * To Generate one One Css & Map file from Sass/Scss
     * @param sassPath Sass/Scss file URI (string)
     * @param targetCssUri Target CSS file URI (string)
     * @param mapFileUri Target MAP file URI (string)
     * @param options - Object - It includes target CSS style and some more.
     */
    private async GenerateCssAndMap(
        sassPath: string,
        targetCssUri: string,
        mapFileUri: string,
        options: Options<"sync">
    ) {


        const generateMap = Helper.getConfigSettings<boolean>("generateMap"),
            compileResult = SassHelper.compileOne(sassPath, targetCssUri, mapFileUri, options),
            promises: Promise<IFileResolver>[] = []

        let autoprefixerTarget = Helper.getConfigSettings<Array<string> | boolean | null>(
            "autoprefix"
        )

        if (compileResult.errorString !== null) {
            return false
        }

        let css: string | undefined = compileResult.result?.css.toString(),
            map: string | undefined | null = compileResult.result?.map?.toString()

        if (css === undefined) {
            return false
        }

        if (autoprefixerTarget === null) {
            autoprefixerTarget = false
        }

        if (autoprefixerTarget != false) {
            try {
                const autoprefixerResult = await this.autoprefix(
                    css,
                    map,
                    targetCssUri,
                    autoprefixerTarget
                )
                css = autoprefixerResult.css
                map = autoprefixerResult.map
            } catch (err) {
                if (err instanceof BrowserslistError) {
                    return false
                } else {
                    throw err
                }
            }
        }

        if (map && generateMap) {
            css += `/*# sourceMappingURL=${path.basename(targetCssUri)}.map */`

            promises.push(FileHelper.writeToOneFile(mapFileUri, map))
        }

        promises.push(FileHelper.writeToOneFile(targetCssUri, css))

        const fileResolvers = await Promise.all(promises)

        fileResolvers.forEach((fileResolver) => {
            if (fileResolver.Exception) {
                console.error("error :", fileResolver)
            } else {

            }
        })

        return true
    }

    private static getWorkspaceFolder(filePath: string) {
        const workspaceFolder = this.basePath

        return workspaceFolder
    }

    private getSassOptions(format: IFormat) {
        return SassHelper.toSassOptions(format)
    }

    private async GenerateAllCssAndMap() {
        const sassPaths = await this.getSassFiles()


        await Promise.all(
            sassPaths.map(async (sassPath, pathIndex) => {


                const workspaceFolder = App.getWorkspaceFolder(sassPath),
                    formats = Helper.getConfigSettings<IFormat[]>("formats")

                await Promise.all(
                    formats.map(async (format, formatIndex) => {


                        // Each format
                        const options = this.getSassOptions(format),
                            cssMapUri = await this.generateCssAndMapUri(
                                sassPath,
                                format

                            )

                        await this.GenerateCssAndMap(
                            sassPath,
                            cssMapUri.css,
                            cssMapUri.map,
                            options
                        )
                    })
                )
            })
        )
    }

    async watch() {
        const sassFiles = []
        while (true) {
            this.findAllSaasFilesAsync((sassPaths: string[]) => {
                sassPaths.forEach(sassPath => {
                    if (!sassFiles.includes(sassPath)) {
                        sassFiles.push(sassPath)
                        let formats = Helper.getConfigSettings<IFormat[]>('formats')
                        watchFile(sassPath, () => {
                            formats.forEach(async format => {
                                let options = this.getSassOptions(format)
                                let cssMapUri = await this.generateCssAndMapUri(sassPath, format)
                                this.GenerateCssAndMap(sassPath, cssMapUri.css, cssMapUri.map, options)
                            })
                        })
                    }
                })
            })
            await delay(1000)
        }
    }

    private async generateCssAndMapUri(
        filePath: string,
        format: IFormat
    ) {
        const extensionName = format.extensionName || ".css"
        const cssUri = filePath.substring(0, filePath.lastIndexOf(".")) + extensionName

        return {
            css: cssUri,
            map: cssUri + ".map",
        }
    }

    /**
     * Autoprefixes CSS properties
     *
     * @param css String representation of CSS to transform
     * @param target What browsers to be targeted, as supported by [Browserslist](https://github.com/ai/browserslist)
     */
    private async autoprefix(
        css: string,
        map: string | undefined,
        savePath: string,
        browsers: Array<string> | true
    ): Promise<{ css: string; map: string | null }> {

        const generateMap = Helper.getConfigSettings<boolean>("generateMap"),
            prefixer = postcss(
                autoprefixer({
                    overrideBrowserslist: browsers === true ? undefined : browsers,
                })
            )

        // TODO: REMOVE - when autoprefixer can stop caching the browsers
        const oldBrowserlistCache = process.env.BROWSERSLIST_DISABLE_CACHE

        if (browsers === true) {
            process.env.BROWSERSLIST_DISABLE_CACHE = "1"
        }

        try {

            const result = await prefixer.process(css, {
                from: savePath,
                to: savePath,
                map: {
                    inline: false,
                    prev: map,
                    annotation: false,
                },
            })

            result.warnings().forEach((warn) => {
                const body: string[] = []

                if (warn.node.source?.input.file) {
                    body.push(warn.node.source.input.file + `:${warn.line}:${warn.column}`)
                }

                body.push(warn.text)
            })

            return {
                css: result.css,
                map: generateMap ? result.map.toString() : null,
            }
        } finally {
            if (browsers === true) {
                process.env.BROWSERSLIST_DISABLE_CACHE = oldBrowserlistCache
            }
        }
    }

}
