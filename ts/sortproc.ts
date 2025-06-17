import { dajTList } from "../components/ts/helper";
import { TColSortType } from "../components/ts/typing";
import { getFieldValue, isString, isnotdefined } from "./j";
import { warn } from "./l";
import { TRow } from "./typing";

function toS(a: string): string {
    if (isString(a)) return a
    warn(`${a.toString} is not a string`);
    return a.toString()
}

type FCompare = (a: TRow, b: TRow, field: string) => number


function fsortinc(a: TRow, b: TRow, field: string): number {
    const fielda: string | undefined = getFieldValue(a, field) as string | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: string = getFieldValue(b, field) as string;
    if (isnotdefined(fieldb)) return -1;
    const fieldas: string = toS(fielda as string)
    const fieldbs: string = toS(fieldb as string)
    return (fieldas as string).localeCompare(fieldbs);
}

function fsortnumberinc(a: TRow, b: TRow, field: string): number {
    const fielda: number | undefined = getFieldValue(a, field) as number | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: number = getFieldValue(b, field) as number;
    if (isnotdefined(fieldb)) return -1;
    return (fielda as number) - fieldb;
}

function fsortboolinc(a: TRow, b: TRow, field: string): number {
    const fielda: boolean | undefined = getFieldValue(a, field) as boolean | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: boolean = getFieldValue(b, field) as boolean;
    if (isnotdefined(fieldb)) return -1;
    if (fielda && fieldb) return 0;
    if (fielda) return 1;
    return -1;
}


function compareProc(a: TRow, b: TRow, field: TColSortType, compare: FCompare): number {
    const fields: string[] = dajTList(field)

    for (let field of fields) {
        const res = compare(a, b, field)
        if (res != 0) return res
    }
    return 0
}

export function sortinc(a: TRow, b: TRow, field: TColSortType): number {
    return compareProc(a, b, field, fsortinc)
}

export function sortnumberinc(a: TRow, b: TRow, field: TColSortType): number {
    return compareProc(a, b, field, fsortnumberinc)
}

export function sortboolinc(a: TRow, b: TRow, field: TColSortType): number {
    return compareProc(a, b, field, fsortboolinc)
}
/*
export function sortinc(a: TRow, b: TRow, field: string): number {
    const fielda: string | undefined = getValue(a,field) as string | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: string = getValue(b,field) as string;
    if (isnotdefined(fieldb)) return -1;
    const fieldas: string = toS(fielda as string)
    const fieldbs: string = toS(fieldb as string)
    return (fieldas as string).localeCompare(fieldbs);
}

export function sortnumberinc(a: TRow, b: TRow, field: string): number {
    const fielda: number | undefined = getValue(a,field) as number | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: number = getValue(b,field) as number;
    if (isnotdefined(fieldb)) return -1;
    return (fielda as number) - fieldb;
}

export function sortboolinc(a: TRow, b: TRow, field: string): number {
    const fielda: boolean | undefined = getValue(a,field) as boolean | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: boolean = getValue(b,field) as boolean;
    if (isnotdefined(fieldb)) return -1;
    if (fielda && fieldb) return 0;
    if (fielda) return 1;
    return -1;
}
*/

