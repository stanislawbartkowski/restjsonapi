import LocalizedStrings, { LocalizedStringsMethods } from 'react-localization';
import { takeCoverage } from 'v8';
import { isOArray } from './j';


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
    insert: 'Wstaw',
    errorreadinglist: "Błąd podczas czytania danych z servera",
    print: "Wykonaj",
    done: "Zrobione",
    moneypattern: "Tylko cyfry, kropka dziesiętna oraz znak na początku",
    chooseaction: "Wybierz",
    searchextended: "Wyszukiwanie zaawansowane",
    removefilter: "Usuń filtr",
    filterclose: "Filtruj i zamknij",
    next: "Dalej",
    prev: "Poprzedni",
    version: "Wersja",
    notdefined: "<nie wprowadzone>",
    yes: "Tak",
    no: "Nie",
    upload: "Upload",
    fileuploadedsuccess: "{0} plik przesłany",
    fileuploadedfailure: "{0} przesłanie pliku nie udało się",
    fullprint: "Cały ekran",
    ok: "OK",
    youarenotauthorized: "Nie masz uprawnień lub nie jesteś zalogowany",
    errorinitauthorization: "Nie mogę nawiązać połączenia z serwerem autentykacyjnym {0}",
    searchnext: "Następny",
    notfoundtitle: "Nie znaleziono",
    notfoundsearch: "Nie znaleziono takiego wiersza",
    notfoundnext: "Nie znaleziono następnego wiersza",
    searchfiltertitle: "Szukaj danych według parametrów",
    largelabel: "Duże",
    middlelabel: "Średnie",
    smalllabel: "Małe",
    sizetabletitle: "Pozwala zmienić rozmiar wyświetlanej tabeli",
    changecolumnstitle: "Zmiana układu kolumn w tabeli",
    doprint: "Drukuj"
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
    insert: 'Insert',
    errorreadinglist: "Error while reading data from server",
    print: "Print",
    done: "Done",
    moneypattern: "Only digits, decimal point and sign at the beginning",
    chooseaction: "Choose",
    searchextended: "Extended searching",
    removefilter: "Remove filter",
    filterclose: "Filter and close",
    next: "Next",
    prev: "Previous",
    version: "Version",
    notdefined: "<empty>",
    yes: "Yes",
    no: "No",
    upload: "Upload",
    fileuploadedsuccess: `{0} file uploaded successfully`,
    fileuploadedfailure: "{0} file upload failed",
    fullprint: "Full print",
    ok: "OK",
    youarenotauthorized: "You are not authorized",
    errorinitauthorization: "Error during connection to authentication server {0}",
    searchnext: "Next",
    notfoundtitle: "Not found",
    notfoundsearch: "Row not found",
    notfoundnext: "Next row not found",
    searchfiltertitle: "Search or filter rows using criteria",
    largelabel: "Large",
    middlelabel: "Middle",
    smalllabel: "Small",
    sizetabletitle: "Specifies the size of the table",
    changecolumnstitle: "Rearrange columns in the table",
    doprint: "Print"
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

const lstring = (id: string, ...args: any): string => {
  const s = strings.getString(id)
  if (args === undefined || args.length === 0) return s;
  if (isOArray(args[0])) {
    const a: any[] = args[0]
    let ss: string = "Too many arguments"

    switch (a.length) {
      case 0: ss = s; break;
      case 1: ss = strings.formatString(s, a[0]).toString(); break;
      case 2: ss = strings.formatString(s, a[0], a[1]).toString(); break;
      case 3: ss = strings.formatString(s, a[0], a[1], a[2]).toString(); break;
      case 4: ss = strings.formatString(s, a[0], a[1], a[2], a[3]).toString(); break;
    }
    return ss;

  }

  const ss = strings.formatString(s, args).toString();
  return ss;
}

export default lstring;
