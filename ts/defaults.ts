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
  verstring: "JS: wersja 1.0 (r:36) z dnia 11 listopada 2022",
  directprefix: "~",
  multichoicevar: "multichoice",
  listpos : "listpos"
};

export default defaults;
