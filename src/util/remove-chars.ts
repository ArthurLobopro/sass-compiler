import { readFileSync, writeFileSync, existsSync } from "fs";
const path = require("path");

function remove(content: string, charToRemove: string) {
    return content.split(charToRemove).join("")
}

export function removeCharFromFile(file_path: string, char: string) {
    if (!existsSync(file_path)) {
        throw new Error("O arquivo especificado não existe")
    }

    const file_content = String(readFileSync(file_path))
    const new_file_content = remove(file_content, char)

    writeFileSync(file_path, new_file_content)
}