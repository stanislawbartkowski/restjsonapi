import { Route } from "react-router-dom";
import { getMenuElemsOnly } from "./leftmenu";
import { getMenuElement } from './constructRestElement'

function getRouterContent() {
  return getMenuElemsOnly().map((e: string) => (
    <Route
      key={e}
      path={"/" + e}
      element={getMenuElement(e)}
    />
  ));
}

export default getRouterContent;
