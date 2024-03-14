import React, { useState } from 'react';
import { Button, Popconfirm, Space } from 'antd';

import { isSec } from '../ts/j';
import { getUserName, logout } from '../ts/keyclock';
import { getHeaderLine } from '../ts/readresource'
import HeaderButtons from './HeaderButtons';
import { FHeaderNameNotifier } from '../ts/typing';
import { log } from '../ts/l';
import { registerNameNotifier } from '../ts/headernotifier';
import InfoHeader from './InfoHeader';
import getIcon from '../ts/icons';
import lstring from '../ts/localize';


const Logout: React.FC = () => {
    if (!isSec()) return <span/>
    const icon = getIcon('logoutoutlined')
    return <Popconfirm title={lstring('logout')} description={lstring('logoutquestion')} onConfirm={logout} >
        <Button icon={icon}>
            {getUserName()}
        </Button>
    </Popconfirm>

}

const HeaderLine: React.FC = () => {

    const [name, SetName] = useState<string | undefined>(undefined);


    const menu = <span style={{ float: 'right', paddingRight: "1%" }}><HeaderButtons /></span>
    const logout = <span style={{ float: 'right', paddingRight: "1%" }}><Logout /></span>

    const changeName: FHeaderNameNotifier = (name: string | undefined) => {
        if (name !== undefined) log(name)
        SetName(name)
    }
    registerNameNotifier(changeName)

    // space is neceesary below

    return <React.Fragment><Space size="large">&ensp;{getHeaderLine()}<InfoHeader info={name} /></Space> {menu} {logout} </React.Fragment>
}

export default HeaderLine
