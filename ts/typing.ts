// ============================================================
// general types
// ==========================================================

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

export type FIsCurrentDB = (t: TRow) => boolean;

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
  choosefield? : string
};


// ===========================
// table props
// ===========================

export type RestTableParam = {
  list?: string;
  params?: Record<string, FieldValue>;
  listdef?: string;
  onRowClick?: OnRowClick;
  isCurrentDB?: FIsCurrentDB;
  onTableRead?: OnTableRead;
  vars?: TRow;
  restaction?: string;
  method?: HTTPMETHOD;
  upload?: boolean;
  component?: string
  modalprops?: PropsType
  choosing?: boolean
};

// ==============================
// modal props
// ==============================


export type FAction = (b?: ButtonElem, r? : TRow) => void

export interface ClickActionProps {
  closeAction?: FAction
  refresh?: FAction
}

export type ModalFormProps = ClickActionProps & {
  visible?: boolean
  ispage?: boolean
}

// ==================================
// general component props
// ==================================

export type TComponentProps = RestTableParam & ModalFormProps

// ========================================
// menu
// ========================================

export type MenuElem = ButtonElem & TComponentProps;
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

export type FieldValue = string | number | boolean | undefined;

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
  TIME = "time"
}

// ==============================
// Localized message
// ==============================

export type FormMessage = JSSupportedType & {
  messagedirect?: string
  message?: string
  params?: string[]
}
