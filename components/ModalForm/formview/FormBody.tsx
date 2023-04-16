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

function produceRow(fbeg: number, fend: number, fields: TField[], eFactory: elemFactory): ReactNode {
    const f: TField = fields[fbeg]
    const rowprops: TGridRow = f.gridrow as TGridRow
    const props: PropsType = rowprops.props ? rowprops.props : { gutter: [64, 64] }
    return <Row {...props} >
        {fields.slice(fbeg, fend).map(e => produceCol(e, eFactory))}
    </Row>
}

function findFirstRow(fields: TField[]): number {
    for (let num = 0; num < fields.length; num++) {
        if (fields[num].gridrow) return num;
    }
    return fields.length;
}

function createRowsSlices(num: number, fields: TField[]): [number, number][] {
    const slices: [number, number][] = []
    while (num < fields.length) {
        const beg: number = num;
        num++;
        while (num < fields.length && fields[num].gridrow === undefined) num++;
        slices.push([beg, num])
    }
    return slices
}

export function produceBody(fields: TField[], eFactory: elemFactory): ReactNode {
    const num: number = findFirstRow(fields);
    const rows: [number, number][] = createRowsSlices(num, fields)
    return <React.Fragment>
        {fields.slice(0, num).map(e => eFactory(e, eFactory))}
        {rows.map(e => produceRow(e[0], e[1], fields, eFactory))}
    </React.Fragment>
}