import React, { ReactNode } from 'react';
import { Button, Card } from 'antd'

import { getPrintContent, PrintResult } from './ts/helper'
import { getPrevious } from '../ts/CustomRouter'
import { getMenuNameByLocation } from '../ts/layoutmenu';
import getIcon from '../ts/icons'
import { history } from '../ts/CustomRouter';

const PrintDisplay: React.FC = (props) => {

    const p: PrintResult = getPrintContent();
    const content: string = p.content
    const id: string = getPrevious()
    const back: ReactNode = getIcon('stepbackwardoutlined')


    const body = (p.result.text) ?<pre>{content}</pre> : <div dangerouslySetInnerHTML={{ __html: content }} />

    console.log(id)

    return <Card title={getMenuNameByLocation(id)} extra={<Button type="primary" icon={back} onClick={() => history.back()} />}  >
        {body}
    </Card>

}

export default PrintDisplay
