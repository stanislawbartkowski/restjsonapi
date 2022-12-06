import { makeStatItem } from "../../ts/transcol";
import { StatisticType } from "../../ts/typing";
import { IFieldContext, FField } from "./types";

// --------------------------
// stat item
// --------------------------

export function produceStatIem(ir: IFieldContext, t: FField): React.ReactNode {
    return makeStatItem(t.stat as StatisticType, { r: ir.getValues() })
}