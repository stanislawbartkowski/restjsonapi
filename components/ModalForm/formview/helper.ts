import { makeMessage } from "../../../ts/j";
import { TRadioCheckItem } from "../../ts/typing";
import { ErrorMessages, ErrorMessage } from "./types";

export function itemName(e: TRadioCheckItem): string | undefined {
    return makeMessage(e.label, { r: {} })
}

export function findErrField(field: string, err: ErrorMessages): ErrorMessage | undefined {
    return err.find(e => e.field === field)
}

