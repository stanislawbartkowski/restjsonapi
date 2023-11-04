import { isString, isnotdefined } from "./j";
import { warn } from "./l";
import { TRow } from "./typing";

function toS(a: string): string {
    if (isString(a)) return a
    warn(`${a.toString} is not a string`);
    return a.toString()
}

export function sortinc(a: TRow, b: TRow, field: string): number {
    const fielda: string | undefined = a[field] as string | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: string = b[field] as string;
    if (isnotdefined(fieldb)) return -1;
    const fieldas: string = toS(fielda as string)
    const fieldbs: string = toS(fieldb as string)
    return (fieldas as string).localeCompare(fieldbs);
}

export function sortnumberinc(a: TRow, b: TRow, field: string): number {
    const fielda: number | undefined = a[field] as number | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: number = b[field] as number;
    if (isnotdefined(fieldb)) return -1;
    return (fielda as number) - fieldb;
}

export function sortboolinc(a: TRow, b: TRow, field: string): number {
    const fielda: boolean | undefined = a[field] as boolean | undefined;
    if (isnotdefined(fielda)) return 1;
    const fieldb: boolean = b[field] as boolean;
    if (isnotdefined(fieldb)) return -1;
    if (fielda && fieldb) return 0;
    if (fielda) return 1;
    return -1;
}
