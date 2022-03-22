import LocalizedStrings from 'react-localization';


const embedded = {
  pl: {
    empty: '',
    searchprompt: 'Szukaj {0}',
    search: 'Szukaj',
    reset: 'Wyzeruj',
    filter: 'Filtruj',
    actions: 'Działania'
  },
  en: {
    empty: '',
    searchprompt: 'Search {0}',
    search: 'Search',
    reset: 'Reset',
    filter: 'Filter',
    actions: 'Actions'
  }
};

const strings = new LocalizedStrings({
  en: {
  },
  pl: {
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
