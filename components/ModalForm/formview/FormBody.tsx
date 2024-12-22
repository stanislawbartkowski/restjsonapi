import React, { ReactNode } from "react";
import { Row } from "antd";

import { TField, TGridRow } from "../../ts/typing";
import { elemFactory } from "./EditItems";
import { PropsType } from "../../../ts/typing";
import { isFieldTrue } from "../../ts/helper";
import { IFieldContext } from "./types";


function produceCol(ir: IFieldContext, f: TField, eFactory: elemFactory): ReactNode {
    const par = { r: ir.getValues() }
    return isFieldTrue(f.hidden, par)
}

function getRowProps(fbeg: number, fbegrow: number, fend: number, fields: TField[]): PropsType | undefined {
    if (fbegrow >= fend) return undefined
    const f: TField = fields[fbegrow]
    const rowprops: TGridRow = f.gridrow as TGridRow
    const props: PropsType = rowprops.props ? rowprops.props : { gutter: [64, 64] }
    return props
}

function produceRow(ir: IFieldContext, fbeg: number, fbegrow: number, fend: number, fields: TField[], eFactory: elemFactory): ReactNode {
    const props: PropsType | undefined = getRowProps(fbeg, fbegrow, fend, fields)

    return <React.Fragment>
        {fields.slice(fbeg, fbegrow).map(e => eFactory(e, eFactory))}
        <Row {...props} >
            {fields.slice(fbegrow, fend).map(e => produceCol(ir, e, eFactory))}
        </Row>
    </React.Fragment>
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

export function produceBody(ir: IFieldContext, fields: TField[], eFactory: elemFactory): ReactNode {
    //#const num: number = findFirstRow(fields);
    const rows: [number, number, number][] = createRowsSlices(fields)
    return <React.Fragment>
        {rows.map(e => produceRow(ir, e[0], e[1], e[2], fields, eFactory))}
    </React.Fragment>
}