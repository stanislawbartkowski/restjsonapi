import { ReactNode } from "react";
import RestTable from "../components/RestTable";
import { MenuElem, RestTableParam } from "./typing";

const menuF: Map<String, ReactNode> = new Map<String, ReactNode>()

let resttableProps: RestTableParam = {}

export function setRestTableProps(p: RestTableParam) {
    resttableProps = p
}

export function addMenuElement(id: string, e: ReactNode) {
    menuF.set(id, e)
}

export function addMenuRestElement(p: MenuElem) {
    const e: ReactNode = <RestTable {...p} list={p.list ? p.list : p.id} {...resttableProps} />
    addMenuElement(p.id, e)
}

export function getMenuElement(id: string): ReactNode {
    return menuF.get(id)
}