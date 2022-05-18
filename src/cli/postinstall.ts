import { removeCharFromFile } from "../util/remove-chars";
import * as path from "path"

if (process.platform === "linux") {
    const cli_path = path.resolve(__dirname, "cli.js")
    removeCharFromFile(cli_path, "\r")
}