import React, { useState } from 'react';
import { Space } from 'antd';
import { Typography } from 'antd';

import { isSec } from '../ts/j';
import { getUserName } from '../ts/keyclock';
import { getHeaderLine } from '../ts/readresource'
import HeaderButtons from './HeaderButtons';
import { FHeaderNameNotifier } from '../ts/typing';
import { log } from '../ts/l';
import { registerNameNotifier } from '../ts/headernotifier';
import InfoHeader from './InfoHeader';


const { Text } = Typography;


const HeaderLine: React.FC = () => {

    const [name, SetName] = useState<string | undefined>(undefined);


    const menu = <span style={{ float: 'right', paddingRight: "1%" }}><HeaderButtons /></span>

    const username: string | undefined = isSec() ? getUserName() : undefined

    const changeName: FHeaderNameNotifier = (name: string | undefined) => {
        if (name !== undefined) log(name)
        SetName(name)
    }
    registerNameNotifier(changeName)

    // space is neceesary below

    return <React.Fragment><Space size="large">&ensp;<Text italic style={{ fontSize: "large" }}>{username}</Text>{getHeaderLine()}<InfoHeader info={name} /></Space> {menu} </React.Fragment>
}

export default HeaderLine
