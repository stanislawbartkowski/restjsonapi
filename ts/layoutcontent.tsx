import React from "react";

import { Route } from "react-router-dom";
import RestTableList from "../../restjsonapi/components/RestTable";
import { getLeftMenu } from "./readresource";
import type { MenuElem } from "./typing";

function getRouterContent() {
  return getLeftMenu().menu.map((e: MenuElem) => (
    <Route
      key={e.id}
      path={"/" + e.id}
      element={<RestTableList list={e.list ? e.list : e.id} />}
    />
  ));
}

export default getRouterContent;
