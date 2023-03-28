interface Defaults {
  defaultmenuicon: string,
  identmul: number,
  dateformat: string,
  moneydot: number,
  defpageSize: number,
  rowkeyS: string
  displayprintrouterid: string,
  cookieage : number,
  currentfield: string,
  verstring: string,
  directprefix: string,
  multichoicevar: string,
  listpos: string
};

const defaults: Defaults = {
  defaultmenuicon: "tableoutlined",
  identmul: 12,
  dateformat: 'YYYY-MM-DD',
  moneydot: 2,
  defpageSize: 20,
  rowkeyS: "rowkey",
  displayprintrouterid: "/printingdisplayer",
  cookieage : 7,
  currentfield: "currentfield",
  verstring: "JS: wersja 1.2 (r:1) z dnia 28 marca 2023",
  directprefix: "~",
  multichoicevar: "multichoice",
  listpos : "listpos"
};

export default defaults;
