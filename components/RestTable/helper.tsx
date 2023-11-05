import { ReactNode } from "react"
import { Button, Space, Tooltip } from "antd"
import { ButtonType } from "antd/lib/button";

import lstring from "../../ts/localize"
import getIcon from "../../ts/icons"
import { RestTableParam } from "../../ts/typing";
import { getCookie, setCookie } from "../../ts/cookies";


export enum VIEW {
    LIST,
    CARD
}

export type changeViewF = (toview: VIEW) => void

function produceButtonIcon(tip: string, iconid: string, onClick: changeViewF, view: VIEW, currentview: VIEW): ReactNode {
    const icon = getIcon(iconid)
    const type: ButtonType = view === currentview ? "dashed" : "text"
    return <Tooltip placement="bottom" title={lstring(tip)}>
        <Button icon={icon} size="small" type={type} onClick={() => onClick(view)} />
    </Tooltip>
}



export function produceChangeDisplay(onClick: changeViewF, currentView: VIEW): ReactNode {

    return <Space>
        {produceButtonIcon("viewcards", "appstoreoutlined", onClick, VIEW.CARD, currentView)}
        {produceButtonIcon("viewlist", "tableoutlined", onClick, VIEW.LIST, currentView)}
    </Space>

}

function cookieName(p: RestTableParam): string {
    const name: string = `viewform=${p.listdef === undefined ? p.list : p.listdef}`
    return name
}

export function saveViewCookie(p: RestTableParam, view: VIEW) {
    setCookie(cookieName(p), VIEW[view])
}

export function getViewCookie(p: RestTableParam, defa: VIEW): VIEW {
    const v: string | undefined = getCookie(cookieName(p))
    if (v === undefined) return defa
    return VIEW[v as keyof typeof VIEW]
}
