import React, { ReactNode } from 'react';
import { Button, Card } from 'antd'

import { getPrintContent } from './ts/helper'
import { getPrevious } from '../ts/CustomRouter'
import { getMenuNameByLocation } from '../ts/layoutmenu';
import getIcon from '../ts/icons'
import { history } from '../ts/CustomRouter';

const PrintDisplay: React.FC = (props) => {

    const content = getPrintContent().content
    const id: string = getPrevious()
    const back: ReactNode = getIcon('stepbackwardoutlined')

    console.log(id)

    return <Card title={getMenuNameByLocation(id)} extra={<Button type="primary" icon={back} onClick={() => history.back()} />}  >
        <div dangerouslySetInnerHTML={{ __html: content }} />
    </Card>

}

export default PrintDisplay
