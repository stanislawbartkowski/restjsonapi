import { emptys } from "../components/ts/helper";
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

export function dateNormalizeS(s: string | undefined): string | undefined {
  if (emptys(s)) return undefined
  const d = dateparseS(s)
  return d === undefined ? undefined : dateremoveT(d)
}
