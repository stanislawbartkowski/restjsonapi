import { internalinfoerrorlog } from "./l";

import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  QuestionOutlined,
  TableOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SmileOutlined,
  MoreOutlined,
  PrinterOutlined,
  StepBackwardOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  ProfileOutlined,
  StepForwardOutlined,
  LoadingOutlined,
  BuildOutlined,
  LikeOutlined,
} from "@ant-design/icons";

import { ReactNode } from "react";

const map = new Map<string, ReactNode>([
  ["useroutlines", <UserOutlined/>],
  ["videocameraoutlined", <VideoCameraOutlined/>],
  ["uploadoutlined", <UploadOutlined/>],
  ["questionoutlined", <QuestionOutlined/>],
  ["tableoutlined", <TableOutlined/>],
  ["pluscircleoutlined",<PlusCircleOutlined />],
  ['deleteoutlined',<DeleteOutlined />],
  ['editoutlines',<EditOutlined />],
  ['smileoutlined',<SmileOutlined />],
  ['moreoutlined',<MoreOutlined />],
  ['printoutlined',<PrinterOutlined />],
  ['stepbackwardoutlined',<StepBackwardOutlined />],
  ['minuscircleoutlined',<MinusCircleOutlined/>],
  ['plusoutlined',<PlusOutlined/>],
  ['checkoutlined',<CheckOutlined />],
  ['profileoutlined',<ProfileOutlined />],
  ['stepsforwardoutlined',<StepForwardOutlined />],
  ['stepsbackwardoutlined',<StepBackwardOutlined />],
  ['loadingoutlined',<LoadingOutlined/> ],
  ['buildoutlined',<BuildOutlined />],
  ['likeoutlined',<LikeOutlined />]
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
