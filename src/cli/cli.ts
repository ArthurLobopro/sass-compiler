#!/usr/bin/env node

import * as comands from "./comands"

const options = Object.fromEntries( Object.entries(comands).map(([key,value]) => [`--${key}`, value])) 

const flags = process.argv.filter( arg => arg.search('--') == 0 && !arg.includes('='))

flags.forEach(flag => {
    options?.[flag]?.()
})