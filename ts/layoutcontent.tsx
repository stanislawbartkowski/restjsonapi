import { Route } from "react-router-dom";
import { getLeftMenu } from "./readresource";
import type { LeftMenuElem } from "./readresource";

function getRouterContent() {
  return getLeftMenu().map((e: LeftMenuElem) => (
    <Route
      key={e.id}
      path={"/" + e.id}
      element={e.elem}
    />
  ));
}

export default getRouterContent;
