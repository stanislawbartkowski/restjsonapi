import type { ReactNode } from 'react';

import type { ModalFormProps, TRow } from '../../ts/typing';

export type PageParams = {
  current?: number;
  pageSize?: number;
}

export type TExtendable = {
  expandedRowRender: (record: TRow) => ReactNode;
  rowExpandable?: (record: TRow) => boolean
}

export const emptyModalListProps : ModalFormProps = { visible : false}
