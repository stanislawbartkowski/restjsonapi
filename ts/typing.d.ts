type FCanDisplay = (p: RestTableParam) => undefined | string;

export type RestTableParam = {
  list: string;
  params?: Record<string, string>;
  listdef?: string;
  onRowClick?: (r: any) => void;
  canDisplay?: FCanDisplay;
  vars?: Record<string, string>;
};

export type FUrlModifier = (list: string) => undefined | Record<string, string>;
