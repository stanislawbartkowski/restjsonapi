import { FIsSelected, OnRowClick, TRow } from "./typing";


let globalclick: OnRowClick = (r: TRow) => { }
let isselected: FIsSelected = (r: TRow) => { return false }

export function setGlobalClick(g: OnRowClick, s: FIsSelected) {
    globalclick = g
    isselected = s
}

export const globalClick: OnRowClick = (r: TRow) => {
    globalclick(r)
}

export const globalSelected: FIsSelected = (r: TRow) => {
    return isselected(r)
}