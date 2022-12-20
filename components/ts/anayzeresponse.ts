import { internalerrorlog } from "../../ts/l";


function getBoundary(response: Response): string | undefined {
    const content: string | null = response.headers.get('Content-Type');
    if (content === null) return undefined
    const items = content.split(';');
    for (let e of items) {
        const k = e.split('=');
        if (k.length > 1 && k[0].trim() === 'boundary') return k[1].trim();
    }
    return undefined
}

function analyzeresponse(data: any, response: Response | undefined): [Record<string, any>, string | undefined] {
    const boundary: string | undefined = response ? getBoundary(response) : undefined

    // if not multipart - data is JSON object
    if (boundary === undefined || boundary === "") return [data, undefined]
    let start: boolean = true
    const result: string[] = []
    let current: number = -1
    const lines = (data as string).split('\n');
    for (let l of lines) {
        if (l.trim() === boundary) {
            start = false
            current++;
            result.push("")
            continue
        }
        if (start) continue
        if (l.trim().startsWith("Content-Type")) continue
        result[current] = result[current] + l + "\n"
    }
    if (result.length !== 2) {
        internalerrorlog(`Error while analyzing multipart result, expected 2 part, found ${result.length}`)
        return [JSON.parse(data), undefined]
    }
    return [JSON.parse(result[0]), result[1]]
}

export default analyzeresponse;
