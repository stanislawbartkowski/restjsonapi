import type { ReactNode } from "react";

import type { TExtendable } from "./typing";
import type { ColumnList, ClickResult, TAction } from "../ts/typing";
import RestTableList from '../RestTable'
import type { TRow } from '../../ts/typing'
import { clickAction } from "../ts/helper";
import { commonVars } from "../../ts/j";

function getExtendableProps(cols: ColumnList, vars?: TRow): TExtendable {


  function expand(r: TRow): ReactNode {
    const rr: TRow = { ...commonVars(), ...r }
    const res: ClickResult = clickAction(cols.extendable as TAction, { r: r, vars: vars });
    return <RestTableList  {...res} vars={rr} />
  }

  return {
    expandedRowRender: expand,
  }
}

export default getExtendableProps
