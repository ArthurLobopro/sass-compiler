import { IFormat } from './helper'
import { LegacyException } from "sass"
import * as compiler from "sass"
import { Helper } from './helper'

export class SassHelper {

    static toSassOptions(format: IFormat): compiler.Options<"sync"> {
        return {
            style: format.format,
        }
    }

    private static instanceOfSassExcpetion(object: unknown): object is LegacyException {
        return "formatted" in (object as LegacyException)
    }

    static compileOne(
        SassPath: string,
        targetCssUri: string,
        mapFileUri: string,
        options: compiler.Options<"sync">,
    ) {
        const generateMap = Helper.getConfigSettings<boolean>("generateMap"),
            data: compiler.Options<"sync"> = {}

        Object.assign(data, options)

        data.logger = {
            warn: (
                message: string,
                options: { deprecation: boolean; span?: compiler.SourceSpan; stack?: string }
            ) => {
                console.warn([message].concat(this.format(options.span, options.stack, options.deprecation)))
            },
            debug: (message: string, options: { span?: compiler.SourceSpan }) => {
                console.log([message].concat(this.format(options.span)))
            },
        }

        try {
            const compile_returns = compiler.compile(SassPath, {
                ...data,
                sourceMap: generateMap,
                logger: data.logger
            })
            const new_result = {
                css: compile_returns.css.toString(),
                ...(generateMap && { map: JSON.stringify(compile_returns.sourceMap) } || {}),
            }

            return { result: new_result, errorString: null }
        } catch (err) {
            console.error(err)
            if (this.instanceOfSassExcpetion(err)) {
                return { result: null, errorString: err.formatted }
            } else if (err instanceof Error) {
                return { result: null, errorString: err.message }
            }

            return { result: null, errorString: "Unexpected error" }
        }
    }

    private static format(
        span: compiler.SourceSpan | undefined | null,
        stack?: string,
        deprecated?: boolean
    ): string[] {
        const stringArray: string[] = []

        if (span === undefined || span === null) {
            if (stack !== undefined) {
                stringArray.push(stack)
            }
        } else {
            stringArray.push(this.charOfLength(span.start.line.toString().length, "╷"))

            let lineNumber = span.start.line

            do {
                stringArray.push(
                    `${lineNumber} |${span.context?.split("\n")[lineNumber - span.start.line] ??
                    span.text.split("\n")[lineNumber - span.start.line]
                    }`
                )

                lineNumber++
            } while (lineNumber < span.end.line)

            stringArray.push(
                this.charOfLength(span.start.line.toString().length, this.addUnderLine(span))
            )

            stringArray.push(this.charOfLength(span.start.line.toString().length, "╵"))

            if (span.url) {
                // possibly include `,${span.end.line}:${span.end.column}`, if VS Code ever supports it
                stringArray.push(`${span.url.toString()}:${span.start.line}:${span.start.column}`)
            }
        }

        if (deprecated === true) {
            stringArray.push("THIS IS DEPRECATED AND WILL BE REMOVED IN SASS 2.0")
        }

        return stringArray
    }

    private static charOfLength(charCount: number, suffix?: string, char = " "): string {
        if (charCount < 0) {
            return suffix ?? ""
        }

        let outString = ""

        for (let item = 0; item <= charCount; item++) {
            outString += char
        }

        return outString + (suffix ?? "")
    }

    private static addUnderLine(span: compiler.SourceSpan): string {
        let outString = "|"

        if (span.start.line !== span.end.line) {
            outString += this.charOfLength(span.end.column - 4, "...^")
        } else {
            outString +=
                this.charOfLength(span.start.column - 2, "^") +
                this.charOfLength(span.end.column - span.start.column - 1, "^", ".")
        }

        return outString
    }
}
