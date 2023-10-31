import React from 'react';
import { Space } from 'antd';

import { isSec } from '../ts/j';
import { getUserName } from '../ts/keyclock';
import { getHeaderLine } from '../ts/readresource'
import HeaderButtons from './HeaderButtons';

const HeaderLine: React.FC = () => {

    const menu = <span style={{ float: 'right', paddingRight: "1%" }}><HeaderButtons /></span>

    if (isSec()) {
        const username: string | undefined = getUserName()
        return <React.Fragment><Space size="large">{username}{getHeaderLine()}</Space> {menu} </React.Fragment>
    }
    else return <React.Fragment><Space align='baseline' size='large' direction='horizontal'>{getHeaderLine()}</Space> {menu} </React.Fragment>
}

export default HeaderLine
