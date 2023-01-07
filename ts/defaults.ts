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
  currentrowkey: string,
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
  currentrowkey: "currentrowkey",
  verstring: "JS: wersja 1.1 (r:05) z dnia 7 stycznia 2023",
  directprefix: "~",
  multichoicevar: "multichoice",
  listpos : "listpos"
};

export default defaults;
