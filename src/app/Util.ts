export function showError(msgHeadline: string, MsgBody: string[], addEndLine = true) {
    let message = msgHeadline
    MsgBody.forEach(line => message += `\n${line}`)
    console.error(message);
}

export async function delay(time: number) {
    return new Promise( resolve => {
        setTimeout(() => {
            resolve(true)
        }, time);
    })
}