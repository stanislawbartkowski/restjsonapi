import React, { CSSProperties, ReactNode, useState } from "react";
import { Card, Col, Row } from 'antd'
import { blue } from '@ant-design/colors';
import { PlusCircleOutlined } from "@ant-design/icons";

import { ButtonAction, ColumnList, FActionResult, TabCardItem, TableHookParam, TActions, TCardTab, TColumn, TColumns, TDetailsCard } from "../ts/typing"
import { detailsTitle, findColDetails, appendStyle, cardProps, visibleColumns, istrue, } from "../ts/helper";
import { fieldTitle, fieldType, HTMLElem, makeDivider, constructactionsCol } from '../ts/transcol';
import { FIELDTYPE, OneRowData } from "../../ts/typing";
import { getButtonName, makeMessage } from "../../ts/j";
import lstring from "../../ts/localize";
import RestComponent from "../RestComponent";

function toCardRow(e: TColumn, t: TDetailsCard, pars: OneRowData): ReactNode {

    const ftype: FIELDTYPE = fieldType(e)
    const content: React.ReactElement = ftype === FIELDTYPE.HTML ? HTMLElem(t.r[e.field] as string) : <span>{t.r[e.field] as string}</span>

    return <Row key={e.field} {...t.rowprops}>
        {e.divider ? makeDivider(e.divider, { r: t.r, vars: t.vars }) : undefined}
        <Col> {fieldTitle(e, pars)}</Col>
        <Col {...t.props} >{content}</Col>
    </Row>
}

function createTabList(cardtab: TCardTab) {
    return cardtab.tabs.map(t => {
        const label = makeMessage(t.label)
        return {
            key: t.key,
            tab: label
        }
    })
}

const RecordCard: React.FC<TDetailsCard & { a?: TActions, h?: TableHookParam }> = (props) => {

    const [activeTabKey, setActiveTabKey] = useState<string>(props.cardtab === undefined ? "" : props.cardtab.defaultActiveKey as string);

    const onTab1Change = (key: string) => {
        setActiveTabKey(key);
    };

    const pars: OneRowData = { vars: props.vars, r: props.r }

    const extram = (props.a !== undefined) ? constructactionsCol(props.a, props.h as TableHookParam, pars) : undefined

    const [isfield, title] = detailsTitle(props, pars)
    const rtitle: React.ReactElement = isfield ? <span style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{title}</span> : <span></span>
    const tcol: TColumn | undefined = findColDetails(props)
    const fcols: TColumns = visibleColumns(props.columns, true);
    const cols: TColumn[] = (tcol !== undefined && isfield) ? fcols.filter(e => e.field !== tcol.field) : fcols

    const selectedcolors: CSSProperties =
        props.isSelected && props.isSelected(props.r) ?
            props.card?.selectedprops ? { ...props.card.selectedprops } : { borderStyle: 'solid', borderWidth: '5px', borderColor: blue[1] }
            : {}

    const propsC = appendStyle(cardProps(props.card), selectedcolors)

    const tabList = props.cardtab === undefined ? undefined : createTabList(props.cardtab)
    const tabprops = props.cardtab === undefined ? undefined : { tabProps: { ...props.cardtab.props } }

    const maincontent = cols.map(e => toCardRow(e, props, pars))

    function znajdzcontent() {
        const tab: TabCardItem | undefined = props.cardtab?.tabs.find(t => t.key === activeTabKey)
        if (tab === undefined) return <span> Internal Error</span>
        if (istrue(tab.ismain)) return maincontent
        return <RestComponent {...tab} vars={props.r} ispage />
    }

    const content = (props.cardtab === undefined) ? maincontent : znajdzcontent()


    return <Card extra={extram} onClick={() => { if (props.onRowClick) props.onRowClick(props.r) }}
        title={rtitle}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTab1Change}
        {...tabprops}
        {...propsC}>
        {content}
    </Card>
}

export const AddCard: React.FC<ColumnList & { b: ButtonAction, cardClick: FActionResult }> = (props) => {

    const b: ButtonAction = props.b

    const propsC = cardProps(props.card)
    const name: string = b.name !== undefined ? getButtonName(b) : lstring('addaction')


    return <Card onClick={() => props.cardClick({}, b)}
        title={name}
        {...propsC} >
        <Row align="middle" justify="center"><Col><PlusCircleOutlined style={{ fontSize: '300%' }} /></Col></Row>
    </Card>

}

export default RecordCard
