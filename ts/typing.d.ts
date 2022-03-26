import { ButtonProps } from "antd";

type FCanDisplay = (p: RestTableParam) => undefined | string;

export enum HTTPMETHOD {
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
  POST = "POST",
}

export type RestTableParam = {
  list: string;
  params?: Record<string, string>;
  listdef?: string;
  onRowClick?: (r: any) => void;
  canDisplay?: FCanDisplay;
  vars?: Record<string, string>;
  nopaging?: boolean;
  restaction?: string;
  method?: HTTPMETHOD;
  upload?: boolean
};

export type FUrlModifier = (list: string) => undefined | Record<string, string>;

export type ButtonElem = {
  id: string;
  icon?: string;
  props?: ButtonProps;
};

export type MenuElem = ButtonElem & RestTableParam;

export type MenuLeft = {
  menu: MenuElem[];
};
