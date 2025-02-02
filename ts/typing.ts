// ============================================================
// general types
// ==========================================================

import { ReactNode } from "react"
import { ButtonAction, FRereadRest, TAction } from "../components/ts/typing"

export type PropsType = Record<string, any>

export type JSSupportedType = {
  js?: string
}

export type PropSupportedType = {
  props?: PropsType
}

export type TBooleanField = boolean & JSSupportedType

// =============================================================
// some customizable functions
// ==============================================================

export type FCanDisplay = (action: string, pathname: string) => boolean

export type FIsSelected = (t: TRow) => boolean;

export type OnRowClick = (r: TRow) => void

export type FUrlModifier = (list: string) => undefined | Record<string, string>;
export type FHeaderModifier = () => Record<string, string>;
export type FHeaderNameNotifier = (name: string | undefined) => void


export enum BreadCrumbAction {
  RESET = 1,
  PUSH = 2,
  POP = 3,
  REPLACE = 4
}

export type FBreadCrumbNotifier = (what: BreadCrumbAction, title?: string) => void


// ============================================================
//  REST/API call
// ==========================================================

export enum HTTPMETHOD {
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
  POST = "POST",
  JS = "JS"
}

export type OnTableRead = (r: JsonTableResult) => void

export type JsonTableResult = {
  res: RowData;
  vars?: TRow
}

export type TReadResource = () => Promise<void>

// =====================
// common button
// =====================

export type ButtonElem = PropSupportedType & {
  id: string;
  icon?: string;
  name?: FormMessage
  choosefield?: string
  trigger?: boolean
  hidden?: TBooleanField
};


// ===========================
// table props
// ===========================

export type RESTMETH = {
  jsaction?: string
  restaction?: string
  method?: HTTPMETHOD;
  upload?: boolean;
  addvars?: TRow,
  params?: Record<string, FieldValue>;
}

export type RestTableParam = RESTMETH & {
  list?: string;
  listdef?: string;
  listcarddef?: string
  listgroupdef?: string
  onRowClick?: OnRowClick;
  isSelected?: FIsSelected;
  onTableRead?: OnTableRead;
  vars?: TRow;
  component?: string
  modalprops?: PropsType
  choosing?: boolean
  initsel?: FieldValue[]
  multiselect?: boolean
  globalrowclick?: boolean
};

// ==============================
// modal props
// ==============================


export type FAction = (b?: ButtonAction, r?: TRow) => void
export type FButtonAction = (b: ButtonAction) => void
export type VAction = (r: TRow) => void
export type RAction = (r?: TAction) => void
export type SetMAction = (sel: FieldValue[]) => void
export type FSetTitle = (title: string | undefined) => void
export type FSetProps = (props: PropsType) => void

export interface ClickActionProps {
  closeAction?: FAction
  refreshaction?: RAction
  rereadRest?: FRereadRest
  setvarsaction?: VAction
  setinitvarsaction?: VAction
  setmulti?: SetMAction
}

export type ModalFormProps = ClickActionProps & {
  visible?: boolean
  ispage?: boolean
  modalprops?: PropsType
  vars?: TRow,
  switchDisplay?: ReactNode
}

export const emptyModalListProps: ModalFormProps = { visible: false, rereadRest: () => { } }


// ==================================
// general component props
// ==================================

export type TComponentProps = RestTableParam & ModalFormProps

// ========================================
// menu
// ========================================

export type MenuElem = ButtonElem & TComponentProps & {
  awesomefont?: string
  breadfont?: string
  menudir?: boolean
  tabs?: MenuElem[]
}

export type TMenuNode = (MenuElem | TSubMenu) & {
  isdev?: boolean
}

export type TSubMenu = PropSupportedType & {
  icon?: string
  title: string | FormMessage
  menus: TMenuNode[]
}

export type MenuLeft = {
  menu: TMenuNode[];
};



// =================================
// data, row, types
// =================================

export type FieldValue = string | number | boolean | undefined | string[] | FieldValue[] | RowData

export type TRow = Record<string, FieldValue>;

export type RowData = TRow[];

export type OneRowData = {
  r: TRow,
  t?: RowData
  vars?: TRow
}

export enum FIELDTYPE {
  NUMBER = "number",
  STRING = "string",
  DATE = "date",
  BOOLEAN = "boolean",
  FUNCTION = "function",
  OBJECT = "object",
  UNDEFINED = "undefined",
  ARRAY = "array",
  ANY = "any",
  MONEY = "money",
  TIME = "time",
  HTML = "html",
  NOFIELD = "nofield",
  INT = "int"
}

// ==============================
// Localized message
// ==============================

export type FormMessage = JSSupportedType & {
  messagedirect?: string
  message?: string
  params?: string[]
}

// ==========================
// defaults
// ==========================

export type ToolbarFeature = "extendedsearch" | "tablesize" | "arrangecol" | "excelfile"

export interface ListToolbar {
  resize?: TResize
  bordered?: TTableBordered
  features?: Record<ToolbarFeature, boolean>
  notool?: boolean
}

export interface TTableBordered {
  bordered?: boolean
}

export interface TResize {
  resize: boolean
  default?: number
  defaultmoney?: number
  defaultboolean?: number
  defaultdate?: number
  defaultnumber?: number
}


export type FieldDefaults = {
  label: string
  len?: number
  max?: number
  width?: number | string
}

export type AppDefaults = {
  fields: FieldDefaults[]
}

export interface LeftMenuResource {
  leftmenu: string
}

export interface AppAuthLabel {
  authlabel?: string
}

export interface AppData {
  appname: string
  logo: string
  logosmall: string
  language: string
  title: string
  version: string,
  js?: string
  showidcolums?: boolean
  toolbar?: ListToolbar
  getleftmenu?: string
  authlabel?: string
  forcenoprod?: boolean
  getcacheinclude: string[]
  getcacheexclude: string[]
  welcome?: RestTableParam
  notbreadcrumb?: boolean
}

