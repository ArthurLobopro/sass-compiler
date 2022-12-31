#!/usr/bin/env node

import * as comands from "./comands"

import { program } from "commander"

program
    .option("--init", "Crate config file")
    .option("--compile", "Compile all files")
    .option("--watch", "Compile on watch mode")
    .action(options => {
        if (options.init) {
            return comands.init()
        }

        if (options.compile) {
            return comands.compile()
        }

        if (options.watch) {
            return comands.watch()
        }
    })

program.parse()