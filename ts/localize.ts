import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';


const embedded = {
  pl: {
    empty: '',
    searchprompt: 'Szukaj {0}',
    search: 'Szukaj',
    reset: 'Wyzeruj',
    filter: 'Filtruj',
    actions: 'Działania',
    addaction: 'Dodaj',
    acceptaction: 'Akceptujesz',
    cancelaction: 'Rezygnujesz',
    areyousure: 'Na pewno?',
    delete: 'Usuń',
    update: 'Zmień',
    errorreadinglist: "Błąd podczas czytania danych z servera",
    print: "Drukuj",
    done: "Zrobione",
    moneypattern: "Tylko cyfry, kropka dziesiętna oraz znak na początku",
    chooseaction: "Wybierz"
  },
  en: {
    empty: '',
    searchprompt: 'Search {0}',
    search: 'Search',
    reset: 'Reset',
    filter: 'Filter',
    actions: 'Actions',
    addaction: 'Add',
    acceptaction: 'Confirm',
    cancelaction: 'Cancel',
    areyousure: 'Are you sure?',
    delete: 'Delete',
    update: 'Update',
    errorreadinglist: "Error while reading data from server",
    print: "Print",
    done: "Done",
    moneypattern: "Only digits, decimal point and sign at the beginning",
    chooseaction: "Choose"
  }
};

const strings: LocalizedStringsMethods = new LocalizedStrings({
  en: {
  },
  pl: {
  }
});

export function setStrings(s: any, l: string | undefined) {
  //    strings.setContent({ ...embedded, ...s });
  if (s == null) return;
  const o = { pl: { ...embedded.pl, ...s.pl }, en: { ...embedded.en, ...s.en } };
  strings.setContent(o);
  if (l) strings.setLanguage(l)
}

const lstring = (id: string, ...args: any[]): string => {
  const s = strings.getString(id)
  const ss: string = strings.formatString(s, ...args).toString()
  return ss;
}

export default lstring;
