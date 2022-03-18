import type { RestTableParam } from '@/restjsonapi/ts/typing';
import type { ProColumns } from '@ant-design/pro-table';
import type { TagProps } from 'antd';
import type { ModalProps } from 'antd'

import type CSS from 'csstype';

export enum Status {
  PENDING,
  READY,
  ERROR,
}


export type FieldValue = string | number | boolean | undefined;


type JSSupportedType = {
  js?: string
}

export type ClickResult = RestTableParam;

export type ClickAction = ClickResult & {
  jsclick?: string
}

export type TAction = JSSupportedType & FormMessage & ClickAction


export type FormMessage = JSSupportedType & {
  messagedirect?: string
  message?: string
  params?: string[]
}

export type ShowDetails = {
  jstitle: FormMessage
}

export type AddStyle = JSSupportedType & {
  style?: CSS.Properties
}

export type ColumnValue = JSSupportedType & FormMessage & {
  value?: FieldValue
}

export type TTag = {
  value: ColumnValue;
  props?: TagProps
}

export type TTags = JSSupportedType & TTag[]

export type TActions = JSSupportedType & TAction[]

export type Column = {
  field: string;
  coltitle?: string;
  props?: ProColumns;
  showdetails?: ShowDetails | boolean;
  ident?: string
  addstyle?: AddStyle
  value?: ColumnValue
  tags?: TTags
  actions?: TActions
};

export type ColumnList = JSSupportedType & {
  key: string
  header?: FormMessage;
  columns: Column[];
  style?: CSS.Properties
};

export const emptyColumnList: ColumnList = { columns: [], key: "" };

export type ListState = {
  status: Status;
  cols: ColumnList;
};

export type Row = any;

export type RowData = Row[];

export type FShowDetails = (entity: Row) => void
export type FActionResult = (entity: Row, r: ClickResult) => void

export type TableHookParam = {
  fdetails: FShowDetails;
  fresult: FActionResult;
}

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type FilterElem = {
  field: string;
  value: FieldValue
  uppercase: string

}

export type SortFilter = {
  filter?: FilterElem[];
  sortinc?: string;
  sortdec?: string;
}

export type JsonTableResult = {
  data: RowData;
}

export const emptyModalListProps: ModalListProps = { visible: false, list: '' };

export type ModalListProps = RestTableParam & {
  visible: boolean
  closehook?: () => void
  props?: ModalProps
}

