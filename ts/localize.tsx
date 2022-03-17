import LocalizedStrings from 'react-localization';


const embedded = {
  pl: {
    "showdatabutton": "Pokaż dane",
    "pickrowalert": "Wskaż wiersz na liście wyświetlonych",
    "adddatabutton": "Dodaj",
    "deletedatabutton": "Usuń",
    "changedatabutton": "Zmień",
    "unrecognizedtoolid": "{0} - unrecognized tool id",
    "ok": "Ok",
    "cancel": "Rezygnujesz",
    "accept": "Akceptujesz",
    "fieldrequired": "Pole jest wymagane",
    "refreshbutton": "Odśwież"
  },
  en: {

  }
};

const strings = new LocalizedStrings({
  en: {
    empty: ''
  },
  pl: {
    empty: ''
  }
});

export function setStrings(s: any) {
  //    strings.setContent({ ...embedded, ...s });
  if (s == null) return;
  const o = { pl: { ...embedded.pl, ...s.pl }, en: { ...embedded.en, ...s.en } };
  strings.setContent(o);
}

const lstring = (id: string, ...args: any[]): string => {
  const s = strings.getString(id)
  const ss: string = strings.formatString(s, ...args).toString()
  return ss;
}

export default lstring;
