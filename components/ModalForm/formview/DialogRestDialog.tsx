import { ReactNode } from "react";
import { FField, IFieldContext } from "./types";
import RestComponent from "../../RestComponent";
import { FieldRestList } from "../../ts/typing";

export function produceRestDialog(ir: IFieldContext, t: FField): ReactNode {
    const restdialog: FieldRestList = t.restdialog as FieldRestList
    return <RestComponent {...restdialog} visible ispage />
}