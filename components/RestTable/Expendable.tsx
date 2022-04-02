import type { ReactNode } from "react";

import type { TExtendable, ColumnList, ClickResult, TAction } from "./typing";
import { clickAction } from './js/helper'
import RestTableList from '../RestTable'
import type { TRow} from '../../ts/typing'

function getExtendableProps(cols: ColumnList): TExtendable {

  function expand(r: TRow): ReactNode {
    const res: ClickResult = clickAction(cols.extendable as TAction, r);
    return <RestTableList {...res} vars={r} />
  }

  return {
    expandedRowRender: expand,
  }
}

export default getExtendableProps
