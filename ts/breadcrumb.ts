let itemlist: string[] = []

export function resetBList(item: string) {
    itemlist = [item]
}

export function getBList(): string[] {
    return itemlist
}