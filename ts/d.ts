import moment from "moment";
import type { Moment } from "moment";
import defaults from "./defaults";

export function datetoS(m: Moment | undefined): string | undefined {
  return m ? moment(m).format(defaults.dateformat) : undefined;
}

export function dateparseS(s: string | undefined): Moment | undefined {
  return s ? moment(s, defaults.dateformat) : undefined;
}

export function dateremoveT(s: Moment): string {
  return datetoS(s) as string
}
