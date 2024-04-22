import { FormListFieldData, UploadFile } from "antd"
import { FieldValue, PropsType, VAction } from "../../../ts/typing"
import { FGetValues, FRereadRest, TAsyncRestCall, TClickButton, TField, TOptionLine } from "../../ts/typing"
import { TRefreshTable } from "../../DrawTable"


export type TableRefreshData = {
    refreshno?: number
    searchR?: TRefreshTable
}

export type FSearchAction = (s: string, t: FField) => void
export type FMultiAction = (t: FField) => void
export type TableRefresh = Map<string, TableRefreshData>;
export type FSetEditRow = (s: string, rownumber: number) => void

export type FField = TField & {

    options?: TOptions
    searchF: FSearchAction
    multiF: FMultiAction
    tableR: TableRefresh
    setvarsaction: VAction
    listfield?: FormListFieldData
    groupT?: TField
    seteditRow: FSetEditRow
    rerenderD: () => void
    genId?: FGenEditId
}

export type TFieldChange = {
    fieldchange: Set<string>;
    notescalatewhenchange: Set<string>;
    nullfields: Set<string>;
}

export type FGenEditId = (id: string) => string
export type UploadStore = Map<string, UploadFile[]>
export type TMultiSelect = Map<string, FieldValue[]>;
export type SetMultiSelect = (t: TField, sel: FieldValue[]) => void
export type fSearchOptions = (t: TField, value: string) => void
export type TOptions = Map<string, TOptionLine[]>
export type TReadCookie = (t: TField, addf?: string) => string | undefined
export type TWriteCookie = (t: TField, val: string | undefined, addf?: string) => void
export type TFieldsProps = Record<string, TField | TField[]>


export interface IFieldContext {
    getChanges: () => TFieldChange
    fieldChanged: (f: FField) => void
    getValues: FGetValues
    aRest: TAsyncRestCall
    upGet: () => UploadStore
    upSet: (p: UploadStore) => void
    getMulti: () => TMultiSelect
    clickButton: TClickButton
    setMulti: SetMultiSelect
    fGetOptions: fSearchOptions
    fReadCookie: TReadCookie,
    fWriteCookie: TWriteCookie,
    rereadRest: FRereadRest,
    fieldsprops: () => TFieldsProps | undefined
}

export type ErrorMessage = {
    field: string,
    message: string
}

export type ErrorMessages = ErrorMessage[]

export const ROWKEY = "rowkey"



