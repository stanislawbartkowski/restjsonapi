import type { PropsType, RestTableParam, ButtonElem, FIELDTYPE, FieldValue, TRow, FIsCurrentDB, OnRowClick, OneRowData, JSSupportedType, FormMessage, PropSupportedType } from '../../ts/typing';

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
    fdetails?: FShowDetails;
    fresult?: FActionResult;
}


// =========================
// common for many types
// =========================

type ReadDefType = JSSupportedType & {
    def?: string
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
    coltitle?: string | FormMessage
    addstyle?: AddStyle
}

// ===============================
// toolbar/buttons feature
// ===============================

export type ButtonAction = ButtonElem & TAction & {
    validate?: boolean
    confirm?: FormMessage | boolean
}

export type TableToolBar = ButtonAction[]


// =======================
// show details feature
// =======================
export type ShowDetails = ReadDefType & PropSupportedType & {
    title?: FormMessage
    toolbar?: TableToolBar
    collist: ColumnList
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
    text?: boolean
}


// click/action result
export type ClickResult = RestTableParam & ActionResult & {
    close?: boolean,
    upload?: boolean
    print?: boolean
}


// click action, statis or dynamic jsclick
export type ClickAction = ClickResult & {
    jsclick?: string
}

// single action, message or click action
export type TAction = ClickAction & FormMessage

// list actions e.g. action columne
export type TActions = JSSupportedType & {
    dropdown?: boolean
    actions?: TAction[]
}


// ==========================
// tags feature
// ==========================

export type TTag = PropSupportedType & {
    value: ColumnValue;
    action?: TAction
}

export type TTags = JSSupportedType & TTag[]

// =============================
// badge feature
// =============================

export type TBadge = JSSupportedType & PropSupportedType & {
    title?: FormMessage
}

// =================================
// divider
// =================================

export type TDivider = FormMessage & {
    props: PropsType
}

// =============================
// single column/field type
// =============================  

export type TColumn = TFieldBase & PropSupportedType & {
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
    tablenodef?: boolean
};

// ===============================
// column/field form descripion
// ===============================

export type TColumns = TColumn[]

export type ColumnList = JSSupportedType & PropSupportedType & {
    rowkey?: string;
    header?: ShowDetails;
    headertitle?: FormMessage;
    columns: TColumns
    iscard?: boolean
    extendable?: TAction;
    summary?: TSummary;
    nopaging?: boolean | number,
    nofilter?: boolean
    nosort?: boolean
    pageSize?: number
    card?: TCard
    rowprops?: PropsType
    filterJS?: string
    onerow?: boolean
};


// ===========================
// details card/description
// ===========================

export type TDetailsCard = ColumnList & OneRowData & {
    isCurrentDB?: FIsCurrentDB
    onRowClick?: OnRowClick
}

// =========================
// Card
// =========================

export type TCard = {
    cardprops?: PropsType
    title?: FormMessage
}

// ==========================
// form
// ==========================

// ratio 

export type TRadioItem = PropSupportedType & {
    value: string,
    label: FormMessage
}

export type TRadio = PropSupportedType & {
    items: TRadioItem[]
    button?: boolean
    select?: boolean
}

// check

export type TCheckItem = TRadioItem


export type TCheckBox = PropSupportedType & {
    items: TCheckItem[]
    select?: boolean
}

// list

export type TListItem = PropSupportedType & {
    addbutton: ButtonElem
    card?: TCard
}

// enter/ search button

export type SearchChooseButton = FormMessage & RestTableParam;


// single field

export type TField = PropSupportedType & TFieldBase & {
    items?: TField[]
    iprops?: PropsType
    radio?: TRadio
    checkbox?: TCheckBox
    list?: TListItem
    range?: boolean
    placeholder?: FormMessage
    enterbutton?: SearchChooseButton
}


// the whole form

export type TForm = JSSupportedType & TCard & {
    fields: TField[]
    formprops?: PropsType
    buttons: ButtonAction[]
}

// ==============================
// modal props
// ==============================


export type TClickButton = (clickbutton?: ButtonAction, row?: TRow) => void

// ============================
// standard buttons 
// ============================
export enum BUTTONACTION {
    ADD = "ADD",
    ACCEPT = "ACCEPT",
    CANCEL = 'CANCEL',
    DEL = 'DEL',
    UPDATE = 'UPDATE',
    PRINT = 'PRINT',
    CHOOSE = 'CHOOSE'
}

