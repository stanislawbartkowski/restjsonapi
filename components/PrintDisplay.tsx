import React, { ReactNode } from 'react';
import { Button, Card } from 'antd'

import { getPrintContent, PrintResult } from './ts/helper'
import { getPrevious } from '../ts/CustomRouter'
import { getMenuNameByLocation } from '../ts/layoutmenu';
import getIcon from '../ts/icons'
import { history } from '../ts/CustomRouter';
import { enhanceLink } from '../services/api';
import lstring from '../ts/localize';

const PrintDisplay: React.FC = (props) => {

    const p: PrintResult = getPrintContent();
    const content: string = p.content
    const id: string = getPrevious()
    const back: ReactNode = getIcon('stepbackwardoutlined')
    const full: ReactNode = getIcon('fullscreenoutlined')
    const name: string = getMenuNameByLocation(id);


    const body = (p.result.text) ? <pre>{content}</pre> : <div dangerouslySetInnerHTML={{ __html: content }} />

    const link: ReactNode | undefined = p.result.printlink ? <Button type="link" icon={full}><a href={enhanceLink(p.result.printlink)} title={name} target="_blank">{lstring("fullprint")}</a></Button> : undefined

    const extra = <React.Fragment> {link}  <Button type="primary" icon={back} onClick={() => history.back()} />  </React.Fragment>

    return <Card title={name} extra={extra}  >
        {body}
    </Card>

}

export default PrintDisplay
