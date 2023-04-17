import React from 'react';
import { isSec } from '../ts/j';
import { getUserName } from '../ts/keyclock';
import { getHeaderLine } from '../ts/readresource'

const HeaderLine: React.FC = () => {

    if (isSec()) {
        const username: string | undefined = getUserName()
        return <React.Fragment><span style={{paddingLeft: 5}}><b>{username}</b></span>  <span style={{paddingLeft: 10}}>{getHeaderLine()}</span></React.Fragment>
    }
    else return <React.Fragment>{getHeaderLine()} </React.Fragment>
}

export default HeaderLine
