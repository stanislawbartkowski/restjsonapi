import React, { useState } from 'react';

import { Breadcrumb } from 'antd';

import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { BreadCrumbAction, FBreadCrumbNotifier, MenuElem } from '../ts/typing';
import { dajMenuNames, dajPathNames, registerNameBNotifier } from '../ts/headernotifier';
import { getButtonName } from '../ts/j';
import { getAppData } from '../ts/readresource';
import { istrue } from '../components/ts/helper';


type ElemB = {
    title: string,
    awesomeclass?: string
}

function produceBody(p: ElemB) {
    if (p.awesomeclass === undefined) return { title: p.title }
    return {
        title: <React.Fragment>
            <div className={p.awesomeclass} style={{ paddingLeft: "15px", paddingRight: "10px" }} />
            {p.title}
        </React.Fragment>
    }
}

const AppBreadCrumb: React.FC = (props) => {

    const [bitemlist, setBList] = useState<ElemB[]>([]);


    const items: ItemType[] = []


    bitemlist.forEach(p => items.push(produceBody(p)))


    const changeName: FBreadCrumbNotifier = (what: BreadCrumbAction, path?: string) => {

        if (what === BreadCrumbAction.RESET) {
            const plist: string[] = (path as string).split('/')
            const bl: ElemB[] = []
            if (plist.length >= 1) {
                const m: MenuElem | undefined = dajMenuNames().get(plist[0])
                if (m !== undefined) {
                    bl.push({ title: getButtonName(m), awesomeclass: m.breadfont !== undefined ? m.breadfont : m.awesomefont })
                }
            }
            const descr = dajPathNames().get(path as string)
            if (descr !== undefined) {
                bl.push({ title: descr })
            }
            setBList(bl)
            return
        }
        const bl: ElemB[] = bitemlist.map(e => Object.assign({}, e))
        switch (what) {
            case BreadCrumbAction.PUSH:
                bl.push({ title: path as string })
                break;
            case BreadCrumbAction.POP:
                bl.pop()
                break;
            case BreadCrumbAction.REPLACE:
                bl.pop()
                bl.push({ title: path as string })
                break;
        }
        setBList(bl)
    }

    if (istrue(getAppData().notbreadcrumb)) {
        return <React.Fragment />
    }

    registerNameBNotifier(changeName)

    return <Breadcrumb
        items={items}
    />


};

export default AppBreadCrumb;