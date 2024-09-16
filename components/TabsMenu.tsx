import { ConfigProvider, Tabs } from "antd"
import { ReactNode } from "react"

import { MenuElem } from "../ts/typing"
import { getButtonName } from "../ts/j"
import { getMenuElement } from "../ts/constructRestElement"
import { getCookie, setCookie } from "../ts/cookies"

function produceTabItem(m: MenuElem): ReactNode {

    const labels: string = getButtonName(m)

    return <Tabs.TabPane tab={labels} key={m.id}>
        {getMenuElement(m.id)}
    </Tabs.TabPane>

}

function cookieName(p: MenuElem): string {
    return `tabmenu-${p.id}`
}

export const MenuTabComponent: React.FC<MenuElem> = (props) => {

    const path: string = props.id
    const e: MenuElem[] = props.tabs as MenuElem[]

    const akey: string | undefined = getCookie(cookieName(props))

    const onChange = (activekey: string) => {
        setCookie(cookieName(props), activekey)
    }

    return <ConfigProvider theme={{
        components: {
            Tabs: {
                horizontalMargin: "0 0 2 0"
            }
        }
    }}>
        <Tabs defaultActiveKey={akey} onChange={onChange} type="card">
            {e.map(produceTabItem)}
        </Tabs>
    </ConfigProvider>
}
