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
  maxdispauto: number
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
  verstring: "JS: wersja 1.2 (r:5) z dnia 10 kwietnia 2023",
  directprefix: "~",
  multichoicevar: "multichoice",
  listpos: "listpos",
  defstartnum: 1,
  maxdispauto: 30
};

export default defaults;
