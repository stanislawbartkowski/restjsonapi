import { ReactNode } from "react";
import { MenuElem, RestTableParam, TComponentProps } from "./typing";
import RestComponent from "../components/RestComponent";

const menuF: Map<String, ReactNode> = new Map<String, ReactNode>()

let resttableProps: RestTableParam = {}

export function setRestTableProps(p: RestTableParam) {
    resttableProps = p
}

export function addMenuElement(id: string, e: ReactNode) {
    menuF.set(id, e)
}

export function addMenuRestElement(p: MenuElem) {
    const pr: TComponentProps = { ...p }
    if (p.list === undefined && p.listdef === undefined) pr.list = p.id
    const e: ReactNode = <RestComponent {...pr} {...resttableProps} ispage />
    addMenuElement(p.id, e)
}

export function getMenuElement(id: string): ReactNode {
    return menuF.get(id)
}