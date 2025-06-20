import type {
    PropsType, RestTableParam, ButtonElem, FIELDTYPE, FieldValue, TRow, FIsSelected, OnRowClick, OneRowData, JSSupportedType,
    FormMessage, PropSupportedType, RESTMETH, RowData, ListToolbar,
    TComponentProps,
    TBooleanField
} from '../../ts/typing';
import { FFieldElem } from './helper';

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
export type FActionResult = (entity: TRow, r: TAction) => void

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

export interface TSummaryDescr {
    descr: FormMessage
    before: string[]
}

export type TSummary = ColumnList | ColumnList[]

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
}

export type MenuButtonAction = ButtonAction & {
    dropdown?: ButtonAction[]
}

export type TableToolBar = MenuButtonAction[]

type HeaderTitleType = FormMessage & PropSupportedType

// =======================
// show details feature
// =======================
export type ShowDetails = ReadDefType & PropSupportedType & {
    title?: HeaderTitleType
    toolbar?: TableToolBar
    collist: ColumnList
    varsrestaction?: TRestVars
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
    ishtml?: boolean
}


// ==============================
// action description
// ==============================

export type FieldError = {
    field: string
    err: FormMessage
}

type IFrameProp = boolean | PropsType & {
    width?: number,
    height?: number,

}


// action result including error to display or notification
export type ActionResult = {
    error?: FieldError[]
    notification?: TNotification
    next?: boolean
    prev?: boolean
    text?: boolean
    vars?: TRow
    steperror?: boolean
    refresh?: boolean
    printlink?: string
    excellink?: string
    iframe?: IFrameProp
    redirect?: string
}


// click/action result
export type ClickResult = RestTableParam & ActionResult & {
    close?: boolean,
    upload?: boolean
    print?: boolean
    download?: boolean
}


// click action, statis or dynamic jsclick
export type ClickAction = ClickResult & {
    jsclick?: string
    button?: ButtonAction
}

// single action, message or click action
export type TAction = ClickAction & FormMessage & PropsType & {
    icon?: string
    retprops?: TAction
    confirm?: FormMessage | boolean
    reread?: boolean
    upvars?: TRow
    noaction?: boolean
}

// list actions e.g. action columne
export type TActions = JSSupportedType & PropSupportedType & {
    dropdown?: boolean
    actions?: TAction[]
    dprops?: PropsType
    showindetails?: boolean
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

// ---- column sort 
export enum ColumnSortType {

    NO, ACC, DESC

}

export interface IColumnSort {
    changeSort: TColumnSortChange
    getSort: TGetColumnSort
}

type TColumnSortChange = (c: TColumn, sort: ColumnSortType) => void

type TGetColumnSort = (c: TColumn) => ColumnSortType

// ----- column filter
type TColumnFilterSet = (c: TColumn, val: string | undefined) => void
type TColumnGetFilter = (c: TColumn) => string | undefined

export interface IColumnFilter {
    setFilter: TColumnFilterSet
    getFilter: TColumnGetFilter
}


export type TResizeColumn = (c: TColumn, newwidth: number) => void

export type TColSortType = string|string[]

export type TColumn = TFieldBase & PropSupportedType & {
    showdetails?: ShowDetails | boolean;
    ident?: string
    value?: ColumnValue
    dvalue?: ColumnValue
    tags?: TTags
    actions?: TActions
    nofilter?: boolean
    nosort?: boolean
    badge?: TBadge
    sum?: boolean
    divider?: TDivider
    tablenodef?: boolean
    stat?: StatisticType
    width?: string | number
    moneydot?: string
    moneydotcol?: string,
    coltosort?: TColSortType
};

// ===============================
// column/field form descripion
// ===============================

export type TColumns = TColumn[]

export type PagingC = {
    nopaging?: boolean | number,
    pageSize?: number

}

export type ColumnList = JSSupportedType & PropSupportedType & PagingC & {
    rowkey?: string;
    header?: ShowDetails;
    headertitle?: FormMessage;
    columns: TColumns
    iscard?: boolean
    extendable?: TAction;
    summary?: TSummary;
    nofilter?: boolean
    nosort?: boolean
    card?: TCard
    cardtab?: TCardTab
    rowprops?: PropsType
    filterJS?: string
    onerow?: boolean
    toolbar?: ListToolbar
    descr?: TSummaryDescr[]
    bordered?: boolean
    sortcol?: string[]
    modalprops?: PropsType,
    noheader?: boolean
};


// ===========================
// details card/description
// ===========================

export type TRestVars = JSSupportedType & RESTMETH & {
    list: string
}

export type TDetailsCard = ColumnList & OneRowData & {
    isSelected?: FIsSelected
    onRowClick?: OnRowClick
    varsrestaction?: TRestVars
}

export type TabCardItem = TComponentProps & {
    label: FormMessage,
    key: string,
    ismain?: boolean
}

export type TCardTab = PropSupportedType & {
    defaultActiveKey?: TCookie
    tabs: TabCardItem[]
}

// =========================
// Card
// =========================

export type TCard = {
    cardprops?: PropsType
    title?: FormMessage
    selectedprops?: PropsType
}

// ==========================
// form
// ==========================


// radio&check

export type TItemsRest = RESTMETH & {
    value: string
    label: FormMessage
    olabel: string
    sublabel?: FormMessage
    onlylabel?: boolean
}

export type TRadioCheckItem = PropSupportedType & {
    value: string,
    label: FormMessage
    sublabel?: FormMessage
}

export type TRadioCheck = PropSupportedType & JSSupportedType & {
    items: TRadioCheckItem[] | TItemsRest
    select?: boolean
}


// radio 

export type TRadio = TRadioCheck & {
    button?: boolean
    segmented?: boolean
}

// check


export type TCheckBox = TRadioCheck

// list

export type TListItem = PropSupportedType & {
    addbutton: ButtonAction
    buttons?: ButtonAction[]
    card?: TCard
    summary?: TSummary
}

// enter/ search button

export type SearchChooseButton = FormMessage & RestTableParam & {
    jsrest?: string
}

export type MultiChoiceButton = SearchChooseButton & ButtonElem

// lista

export type TListItems = PropSupportedType & {
    header?: FormMessage
    footer?: FormMessage
    lprops?: PropsType
    vprops?: PropsType
    linkprops?: PropsType
    iprops?: PropsType
}

// single field

export type RestValidatorResult = {
    err?: FormMessage;
}

export type ValidatorType = JSSupportedType & {
    required?: true
    pattern?: string
    message?: FormMessage
    restaction?: RESTMETH
    alsoempty?: boolean,
    vars?: TRow
}

export type StatisticType = PropSupportedType & JSSupportedType & {
    title: FormMessage
    icon?: string
    valueStyle?: PropsType
    value: FieldValue
}

export type UploadType = JSSupportedType & ButtonAction & {
    uploadprops?: PropsType
}

export type FieldRestList = JSSupportedType & RestTableParam

export type TGridRow = PropSupportedType
export type TGridCol = PropSupportedType


export type TPanelHeader = {
    header: FormMessage
    key: string
}

export type TPanel = PropSupportedType & TPanelHeader & {
    items: TField[]
}


export type TDynamicPanel = RESTMETH & {
    items: TField[]
}

export type TCookieO = {
    cookie?: true
    addf?: string
    default?: string
}

export type TCookie = string | TCookieO

export type TabItems = PropSupportedType & {
    label: FormMessage
    key: string,
    items: TField[]
}

export type TTab = PropSupportedType & {
    defaultActiveKey?: TCookie
    tabs: TabItems[]
}

export type TToolTip = PropSupportedType & FormMessage

export type TRedirectLnk = ButtonElem & {
    redirect: string
}

export type TField = PropSupportedType & TFieldBase & {
    items?: TField[]
    iprops?: PropsType
    radio?: TRadio
    checkbox?: TCheckBox
    list?: TListItem
    range?: boolean
    placeholder?: FormMessage
    enterbutton?: SearchChooseButton
    onchange?: ButtonAction
    validate?: ValidatorType[]
    novalidate?: boolean,
    divider?: TDivider
    bottomdivider?: TDivider
    itemlist?: TListItem
    editlist?: TListItem & PagingC
    value?: ColumnValue
    stat?: StatisticType
    upload?: UploadType
    multichoice?: MultiChoiceButton
    restlist?: FieldRestList
    restdialog?: FieldRestList
    toupper?: boolean
    tolower?: boolean
    actions?: TActions
    refreshsum?: boolean
    col?: TColumn
    gridrow?: TGridRow
    gridcol?: TGridCol
    disabled?: boolean
    istextarea?: boolean
    label?: string
    autocomplete?: string
    button?: ButtonAction
    collapse?: TPanel[]
    dynamiccollapse?: TDynamicPanel
    tab?: TTab
    moneydot?: string
    colwidth?: string | number
    tooltip?: TToolTip,
    hidden?: TBooleanField
    redirect?: TRedirectLnk
}

// the whole form

export type TAutoComplete = RestTableParam & JSSupportedType & {
    minlen?: number
    maxdisp?: number
    id: string
    colname?: string
    labelname?: string
}

export type TForm = JSSupportedType & TCard & {
    fields: TField[]
    formprops?: PropsType
    buttons: ButtonAction[]
    beforedialog?: string | RESTMETH
    restapivals?: string | RESTMETH
    jsrestapivals?: string
    header?: ShowDetails
    autocomplete?: TAutoComplete[]
    modalprops?: PropsType
}

// --------------------------------
// steps
// --------------------------------

// ==================================
// presentation data
// ==================================

export type StepsElem = PropSupportedType & {
    title: FormMessage
}

export type StepsForm = PropSupportedType & {
    steps: StepsElem[]
    vars?: TRow
    initvals?: TRow
}

export type PreseForms = TForm | ColumnList

export enum TPreseEnum {
    TForm, ColumnList, Steps
}

// ===== buttons 

export type TClickButton = (clickbutton?: ButtonAction, row?: TRow, t?: RowData) => void

export type TAsyncRestCall = (h: RESTMETH, row: TRow) => Promise<TRow>

export type FOnValuesChanged = (changedFields: Record<string, any>, _: Record<string, any>) => void

export type FOnFieldChanged = (id: string, newval?: FieldValue) => void

export type FGetValues = () => TRow
export type FSetValues = (r: TRow) => void
export type FGetOptions = (id: string, val: string) => TOptionLine[]
export type FRetAction = (b: TAction, row: TRow) => void
export type FRereadRest = () => void
export type FGetAutocomplete = () => TAutoCompleteMap | undefined
export type FGetFieldsList = () => FFieldElem[]

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
    CHOOSE = 'CHOOSE',
    NEXT = 'NEXT',
    PREV = 'PREV',
    UPLOAD = 'UPLOAD',
    OK = "OK",
    SEARCH = "SEARCH",
    SEARCHNEXT = "SEARCHNEXT",
    DOPRINT = "DOPRINT",
    DOWNLOAD = 'DOWNLOAD'
}

// =================
// autocomplete
// =================

export type TOptionLine = {
    value: string
    label?: string | JSX.Element
}

export type TAutoCompleteMap = Map<string, RowData>

