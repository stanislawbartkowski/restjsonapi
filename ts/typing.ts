// ============================================================
// general types
// ==========================================================

import { ButtonAction, TAction } from "../components/ts/typing"

export type PropsType = Record<string, any>

export type JSSupportedType = {
  js?: string
}

export type PropSupportedType = {
  props?: PropsType
}

// =============================================================
// some customizable functions
// ==============================================================

export type FCanDisplay = (action: string, pathname: string) => boolean

export type FIsSelected = (t: TRow) => boolean;

export type OnRowClick = (r: TRow) => void

export type FUrlModifier = (list: string) => undefined | Record<string, string>;


// ============================================================
//  REST/API call
// ==========================================================

export enum HTTPMETHOD {
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
  POST = "POST",
}

export type OnTableRead = (r: JsonTableResult) => void

export type JsonTableResult = {
  res: RowData;
  vars?: PropsType
}

// =====================
// common button
// =====================

export type ButtonElem = PropSupportedType & {
  id: string;
  icon?: string;
  name?: FormMessage
  choosefield?: string
  trigger?: boolean
};


// ===========================
// table props
// ===========================

export type RESTMETH = {
  jsaction? : string
  restaction?: string
  method?: HTTPMETHOD;
  upload?: boolean;
  params?: Record<string, FieldValue>;
}

export type RestTableParam = RESTMETH & {
  list?: string;
  listdef?: string;
  onRowClick?: OnRowClick;
  isSelected?: FIsSelected;
  onTableRead?: OnTableRead;
  vars?: TRow;
  component?: string
  modalprops?: PropsType
  choosing?: boolean
  initsel? : FieldValue[]
  multiselect?: boolean
};

// ==============================
// modal props
// ==============================


export type FAction = (b?: ButtonAction, r?: TRow) => void
export type VAction = (r : TRow) => void
export type RAction = (r? : TAction) => void

export interface ClickActionProps {
  closeAction?: FAction
  refreshaction?: RAction
  setvarsaction?: VAction
}

export type ModalFormProps = ClickActionProps & {
  visible?: boolean
  ispage?: boolean
  modalprops?: PropsType
  vars?: TRow
}

export const emptyModalListProps: ModalFormProps = { visible: false }


// ==================================
// general component props
// ==================================

export type TComponentProps = RestTableParam & ModalFormProps

// ========================================
// menu
// ========================================

export type MenuElem = ButtonElem & TComponentProps & {
  menudir?: boolean
}

export type TMenuNode = MenuElem | TSubMenu

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

export type FieldValue = string | number | boolean | undefined | string[] | FieldValue[]

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
  HTML = "html"
}

// ==============================
// Localized message
// ==============================

//export type FormMessage = JSSupportedType & (string | undefined) & {
export type FormMessage = JSSupportedType & {
  messagedirect?: string
  message?: string
  params?: string[]
}

