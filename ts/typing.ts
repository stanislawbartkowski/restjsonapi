type FCanDisplay = (p: RestTableParam) => undefined | string;
export type FIsCurrentDB = (t: TRow) => boolean;

export type PropsType = Record<string, any>

export type OnRowClick = (r : TRow) => void


export enum HTTPMETHOD {
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
  POST = "POST",
}

export type RestTableParam = {
  list?: string;
  params?: Record<string, FieldValue>;
  listdef?: string;
  onRowClick?: OnRowClick;
  canDisplay?: FCanDisplay;
  isCurrentDB?: FIsCurrentDB;
  vars?: TRow;
  restaction?: string;
  method?: HTTPMETHOD;
  upload?: boolean;
  component?: string
};

export type FUrlModifier = (list: string) => undefined | Record<string, string>;

export type ButtonElem = {
  id: string;
  icon?: string;
  props?: PropsType;
};

export type MenuElem = ButtonElem & RestTableParam;
export type TMenuNode = MenuElem | TSubMenu

export type TSubMenu = {
  icon?: string
  props?: PropsType
  title: string
  menus: TMenuNode[]  
}

export type MenuLeft = {
  menu: TMenuNode[];
};

export type FieldValue = string | number | boolean | undefined;

export type TRow = Record<string, FieldValue>;

export type RowData = TRow[];

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
}
