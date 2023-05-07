import type { ReactNode } from 'react';
import { SizeType } from "antd/es/config-provider/SizeContext";

import type { TRow } from '../../ts/typing';

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean,
  fixed: boolean,
  columnWidth: number
}

export type FSetSize = (size: SizeType) => void

export interface ColumnT  {
  title: string,
  key: string,
  included: boolean
}

export type ColumnsT = ColumnT[]

export type ColumnsHook = (cols: ColumnsT) => void

export type SortProps = {
  cols: ColumnsT
  colshook: ColumnsHook
}
