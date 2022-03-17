type FCanDisplay = (p: RestTableParam) => undefined | string;

export type RestTableParam = {
  list: string;
  listdef: string;
  onRowClick?: (r: any) => void;
  canDisplay?: FCanDisplay;
};

export type FUrlModifier = (list: string) => undefined | any;
