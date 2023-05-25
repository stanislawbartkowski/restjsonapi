interface Defaults {
  defaultmenuicon: string,
  identmul: number,
  dateformat: string,
  moneydot: number,
  defpageSize: number,
  rowkeyS: string
  displayprintrouterid: string,
  cookieage: number,
  currentfield: string,
  verstring: string,
  directprefix: string,
  multichoicevar: string,
  listpos: string,
  defstartnum: number,
  maxdispauto: number,
  sizedefault: number,
  sizemoney: number,
  sizeboolean: number,
  sizedate: number,
  sizenumber: number,
  expandSize: number,
  checkSize: number,
  fieldsprops: string,
  downloadfileaction: string,
  downloadfile: string,
  excelext: string
};

const defaults: Defaults = {
  defaultmenuicon: "tableoutlined",
  identmul: 12,
  dateformat: 'YYYY-MM-DD',
  moneydot: 2,
  defpageSize: 20,
  rowkeyS: "rowkey",
  displayprintrouterid: "/printingdisplayer",
  cookieage: 7,
  currentfield: "currentfield",
  verstring: "JS: wersja 1.3 (r:04) z dnia 25 maja 2023",
  directprefix: "~",
  multichoicevar: "multichoice",
  listpos: "listpos",
  defstartnum: 1,
  maxdispauto: 30,
  sizedefault: 100,
  sizemoney: 20,
  sizeboolean: 20,
  sizedate: 25,
  sizenumber: 35,
  expandSize: 6,
  checkSize: 5,
  fieldsprops: "fieldsprops",
  downloadfileaction: "downloadfile",
  downloadfile: "Tabela",
  excelext: ".xlsx"
};

export default defaults;
