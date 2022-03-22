import { internalinfoerrorlog } from "../ts/j";

import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  QuestionOutlined,
  TableOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import { ReactNode } from "react";

const map = new Map<string, ReactNode>([
  ["useroutlines", <UserOutlined/>],
  ["videocameraoutlined", <VideoCameraOutlined/>],
  ["uploadoutlined", <UploadOutlined/>],
  ["questionoutlined", <QuestionOutlined/>],
  ["tableoutlined", <TableOutlined/>],
  ["pluscircleoutlined",<PlusCircleOutlined />]
]);

function getIcon(id?: string, defaultid?: string): ReactNode {
  if (id === undefined && defaultid === undefined) {
    internalinfoerrorlog("getIcon", "both paraneters are undefined", false);
    return <QuestionOutlined />;
  }
  const iid: string = id ? id : (defaultid as string);
  const i: ReactNode | undefined = map.get(id ? id : (defaultid as string));
  if (i) return i
  internalinfoerrorlog("getIcon", `${iid} does not exist`, false);
  return <QuestionOutlined />;
}

export default getIcon;
