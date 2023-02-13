import { FormListFieldData, UploadFile } from "antd"
import { FieldValue, VAction } from "../../../ts/typing"
import { FGetValues, TAsyncRestCall, TClickButton, TField } from "../../ts/typing"

export type FSearchAction = (s: string, t: FField) => void
export type FMultiAction = (t: FField) => void
export type TableRefresh = Map<string, number>;
export type FSetEditRow = (s : string, rownumber: number) => void

export type FField = TField & {

    searchF: FSearchAction
    multiF: FMultiAction
    tableR: TableRefresh
    setvarsaction: VAction
    listfield?: FormListFieldData
    groupT?: TField
    seteditRow: FSetEditRow
    rerenderD: () => void
}

export type TFieldChange = {
    fieldchange: Set<string>;
    notescalatewhenchange: Set<string>;
    nullfields: Set<string>;
}

export type UploadStore = Map<string, UploadFile[]>
export type TMultiSelect = Map<string, FieldValue[]>;
export type SetMultiSelect = (t : TField, sel: FieldValue[]) => void


export interface IFieldContext {
    getChanges: () => TFieldChange
    fieldChanged: (f : FField) => void
    getValues: FGetValues
    aRest: TAsyncRestCall
    upGet: () => UploadStore
    upSet: (p: UploadStore) => void
    getMulti: () => TMultiSelect
    clickButton: TClickButton
    setMulti: SetMultiSelect
}

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]

export const ROWKEY = "rowkey"


