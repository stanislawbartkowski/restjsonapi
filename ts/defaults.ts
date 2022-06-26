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
  directprefix: string
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
  verstring: "Wersja 1.0 (r:10) z dnia 27 czerwca 2022 roku",
  directprefix: "~"
};

export default defaults;
