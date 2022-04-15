import { Props } from 'react';
import type { PropsType, RestTableParam, ButtonElem, FIELDTYPE, FieldValue, TRow, FIsCurrentDB, OnRowClick } from '../../ts/typing';

// =========================
// status for async reading
// =========================

export enum Status {
    PENDING,
    READY,
    ERROR,
}

// ===========================
// hook function
// ===========================

export type FShowDetails = (entity: TRow) => void
export type FActionResult = (entity: TRow, r: ClickResult) => void

export type TableHookParam = {
    fdetails: FShowDetails;
    fresult: FActionResult;
}


// =========================
// common for many types
// =========================
export type JSSupportedType = {
    js?: string
}

// ===========================
// additional stylin property
// ===========================

export type AddStyle = JSSupportedType & {
    style?: PropsType
}

// ============================
// summary feature
// ============================

export type TSummary = ColumnList


// =============================
// common for field/column type
// =============================
export type TFieldBase = {
    field: string;
    fieldtype?: FIELDTYPE,
    coltitle?: string;
    addstyle?: AddStyle
}

// =======================
// show details feature
// =======================
export type ShowDetails = {
    title: FormMessage
    columns: TColumns
    props: PropsType
}

// =============================  
// custom value feature
// =============================

export type ColumnValue = JSSupportedType & FormMessage & {
    value?: FieldValue
}

// ================================
// notification
// ================================

export enum NotificationKind {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
    WARN = 'warn',
}

export type TNotification = {
    kind?: NotificationKind,
    title: FormMessage,
    description: FormMessage
}


// ==============================
// action description
// ==============================

export type FieldError = {
    field: string
    err: FormMessage
}

// action result including error to display or notification
export type ActionResult = {
    error?: FieldError[]
    notification?: TNotification
    component?: string
}


// click/action result
export type ClickResult = RestTableParam & ActionResult & {
    close?: boolean,
    upload?: boolean
}


// click action, statis or dynamic jsclick
export type ClickAction = ClickResult & {
    jsclick?: string
}

// single action, message or click action
export type TAction = ClickAction & FormMessage

// list actions e.g. action columne
export type TActions = JSSupportedType & TAction[]


// ==========================
// tags feature
// ==========================

export type TTag = {
    value: ColumnValue;
    props?: PropsType
    action?: TAction
}

export type TTags = JSSupportedType & TTag[]

// =============================
// badge feature
// =============================

export type TBadge = JSSupportedType & {
    title?: FormMessage
    props: PropsType
}

// ===============================
// toolbar/buttons feature
// ===============================

export type ButtonAction = ButtonElem & TAction & {
    validate?: boolean
    confirm?: FormMessage | boolean
}


export type TableToolBar = ButtonAction[]

// =================================
// divider
// =================================

export type TDivider = FormMessage & {
    props: PropsType
}

// =============================
// single column/field type
// =============================  

export type TColumn = TFieldBase & {
    props?: PropsType;
    showdetails?: ShowDetails | boolean;
    ident?: string
    value?: ColumnValue
    tags?: TTags
    actions?: TActions
    nofilter?: boolean
    nosort?: boolean
    badge?: TBadge
    sum?: boolean
    divider?: TDivider
};

// ===============================
// column/field form descripion
// ===============================

export type TColumns = TColumn[]

export type ColumnList = JSSupportedType & {
    rowkey: string;
    header?: FormMessage;
    columns: TColumns
    iscard?: boolean
    extendable?: TAction;
    toolbar?: TableToolBar;
    summary?: TSummary;
    nopaging?: boolean | number,
    nofilter?: boolean
    nosort?: boolean
    pageSize?: number
    props?: PropsType
    cardprops?: PropsType
    rowprops?: PropsType
    filterJS?: string
};


// ===========================
// details card/description
// ===========================

export type TDetailsCard = ColumnList & {
    r: TRow,
    isCurrentDB?: FIsCurrentDB
    onRowClick?: OnRowClick
}


// ========================
// message
// ========================

export type FormMessage = JSSupportedType & {
    messagedirect?: string
    message?: string
    params?: string[]
}
