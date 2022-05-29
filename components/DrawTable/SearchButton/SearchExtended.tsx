import { forwardRef, MutableRefObject, useImperativeHandle, useRef } from "react";

import { TRow } from "../../../ts/typing"
import type { ColumnList, TField } from "../../ts/typing"
import ModalFormView, { ErrorMessages, FOnFieldChanged, FOnValuesChanged, IRefCall } from "../../ModalForm/ModalFormView";
import { FFieldElem, flattenTForm } from "../../ts/helper";
import { convertColumnsToFields } from "./helper";


export interface IIRefCall {
    getValues: () => TRow
}


export type SearchButtonType = ColumnList & ExtendedFilter & {
}

type SearchDialog = SearchButtonType & {
    buttons: React.ReactNode[]
    onValuesChanges?: FOnValuesChanged
}


export type ExtendedFilter = {
    isfilter: boolean
    filtervalues: TRow
}

export const noExtendedFilter: ExtendedFilter = { isfilter: false, filtervalues: {} }

const SearchExtended = forwardRef<IIRefCall, SearchDialog>((props, iref) => {


    const refm: MutableRefObject<IRefCall> = useRef<IRefCall>() as MutableRefObject<IRefCall>

    useImperativeHandle(iref, () => ({
        getValues: () => refm.current.getValues()
    }
    ));

    const fields: TField[] = convertColumnsToFields(props)
    function buttonClickded(r: TRow) { }
    const ffields: FFieldElem[] = flattenTForm(fields)
    const err: ErrorMessages = []
    const onValuesChanges: FOnValuesChanged = (changedFields: Record<string, any>, p: Record<string, any>) => {
        if (props.onValuesChanges) props.onValuesChanges(changedFields, p);
    }
    const onFieldChange: FOnFieldChanged = (id: string) => {
    }


    return <ModalFormView ref={refm} fields={fields} buttonClicked={buttonClickded} initvals={props.filtervalues} list={ffields} buttons={[]} buttonsextratop={props.buttons} err={err} onValuesChanges={onValuesChanges} onFieldChange={onFieldChange} />

})

export default SearchExtended