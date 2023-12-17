import React, { ReactNode } from "react";
import { Col, Row } from "antd";

import { TField, TGridRow } from "../../ts/typing";
import { elemFactory } from "./EditItems";
import { PropsType } from "../../../ts/typing";


function produceCol(f: TField, eFactory: elemFactory): ReactNode {
    const props = f.gridcol ? f.gridcol.props : undefined
    return <Col {...props}>  
        {eFactory(f, eFactory)}
    </Col>
}

function getRowProps(fbeg: number, fbegrow: number, fend: number, fields: TField[]) : PropsType | undefined {
    if (fbegrow >= fend) return undefined
    const f: TField = fields[fbegrow]
    const rowprops: TGridRow = f.gridrow as TGridRow
    const props: PropsType = rowprops.props ? rowprops.props : { gutter: [64, 64] }
    return props
}

function produceRow(fbeg: number, fbegrow: number, fend: number, fields: TField[], eFactory: elemFactory): ReactNode {
    //const f: TField = fields[fbeg]
    //const rowprops: TGridRow = f.gridrow as TGridRow
    //const props: PropsType = rowprops.props ? rowprops.props : { gutter: [64, 64] }
    const props: PropsType | undefined = getRowProps(fbeg, fbegrow, fend, fields)

    return <React.Fragment>
        {fields.slice(fbeg, fbegrow).map(e => eFactory(e, eFactory))}
        <Row {...props} >
            {fields.slice(fbegrow, fend).map(e => produceCol(e, eFactory))}
        </Row>
    </React.Fragment>
}

function findFirstRow(fields: TField[]): number {
    for (let num = 0; num < fields.length; num++) {
        if (fields[num].gridrow) return num;
    }
    return fields.length;
}

function createRowsSlices(fields: TField[]): [number, number, number][] {
    let num: number = 0;
    const slices: [number, number, number][] = []
    while (num < fields.length) {
        const beg: number = num;
        while (num < fields.length && fields[num].gridrow === undefined) num++;
        const begrow: number = num
        if (num < fields.length) {
            num++;
            while (num < fields.length && (fields[num].gridrow === undefined && fields[num].gridcol !== undefined)) num++;
        }
        slices.push([beg, begrow, num])
    }
    return slices
}

export function produceBody(fields: TField[], eFactory: elemFactory): ReactNode {
    //#const num: number = findFirstRow(fields);
    const rows: [number, number, number][] = createRowsSlices(fields)
    return <React.Fragment>
        {rows.map(e => produceRow(e[0], e[1], e[2], fields, eFactory))}
    </React.Fragment>
}