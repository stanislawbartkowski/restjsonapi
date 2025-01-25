import React, { ReactNode } from 'react';
import { Button, Card } from 'antd'

import { combineProps, getPrintContent, PrintResult } from './ts/helper'
import { getPrevious } from '../ts/CustomRouter'
import { getMenuNameByLocation } from '../ts/layoutmenu';
import getIcon from '../ts/icons'
import { history } from '../ts/CustomRouter';
import { enhanceLink } from '../services/api';
import lstring from '../ts/localize';
import { PropsType } from '../ts/typing';
import { isBool } from '../ts/j';

function htmlBody(p: PrintResult) {
    const content: string = p.content
    const body = (p.result.text) ? <pre>{content}</pre> : <div dangerouslySetInnerHTML={{ __html: content }} />
    return body
}

function iframeBody(p: PrintResult) {
    const link = enhanceLink(p.result.printlink as string)
    const defaultframeP: PropsType = {
        width: 900,
        height: 900,
        style: {
            "border-width": 1
        }
    }
    let frameP: PropsType = defaultframeP
    if (!isBool(p.result.iframe)) {
        frameP = combineProps(frameP, p.result.iframe as PropsType)
    }
    return <iframe src={link} {...frameP}></iframe>

}

function isIFrame(p: PrintResult) {
    if (p.result.printlink === undefined) return false;
    return p.result.iframe !== undefined
}

const PrintDisplay: React.FC = (props) => {

    const p: PrintResult = getPrintContent();
    const id: string = getPrevious()
    const back: ReactNode = getIcon('stepbackwardoutlined')
    const full: ReactNode = getIcon('fullscreenoutlined')
    const excel: ReactNode = getIcon('fileexceloutlined')
    const name: string = getMenuNameByLocation(id);


    const body = isIFrame(p) ? iframeBody(p) : htmlBody(p)

    const link: ReactNode | undefined = p.result.printlink ? <Button type="link" icon={full}><a href={enhanceLink(p.result.printlink)} title={name} target="_blank">{lstring("fullprint")}</a></Button> : undefined
    const excellink: ReactNode | undefined = p.result.excellink ? <Button type="link" icon={excel}><a href={enhanceLink(p.result.excellink)} target="_blank">{lstring("downloadexcelbutton")}</a></Button> : undefined


    const extra = <React.Fragment>{excellink} {link}  <Button type="primary" icon={back} onClick={() => history.back()} />  </React.Fragment>

    return <Card title={name} extra={extra}  >
        {body}
    </Card>

}

export default PrintDisplay
