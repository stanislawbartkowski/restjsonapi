//import moment from "moment";
//import type { Moment } from "moment";
import defaults from "./defaults";
import dayjs from 'dayjs';

export function datetoS(m: dayjs.Dayjs | undefined): string | undefined {
  return m ? dayjs(m).format(defaults.dateformat) : undefined;
}

export function dateparseS(s: string | undefined): dayjs.Dayjs | undefined {
  return s ? dayjs(s, defaults.dateformat) : undefined;
}

export function dateremoveT(s: dayjs.Dayjs): string {
  return datetoS(s) as string
}
