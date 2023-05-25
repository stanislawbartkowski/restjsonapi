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
  FullscreenOutlined,
  EnterOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  DeleteRowOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FormOutlined,
  FontSizeOutlined,
  ForwardOutlined,
  FileExcelOutlined
} from "@ant-design/icons";

import { ReactNode } from "react";

const map = new Map<string, ReactNode>([
  ["useroutlines", <UserOutlined rev/>],
  ["videocameraoutlined", <VideoCameraOutlined rev/>],
  ["uploadoutlined", <UploadOutlined rev/>],
  ["questionoutlined", <QuestionOutlined rev/>],
  ["tableoutlined", <TableOutlined rev/>],
  ["pluscircleoutlined", <PlusCircleOutlined rev/>],
  ['deleteoutlined', <DeleteOutlined rev/>],
  ['editoutlines', <EditOutlined rev/>],
  ['smileoutlined', <SmileOutlined rev/>],
  ['moreoutlined', <MoreOutlined rev/>],
  ['printoutlined', <PrinterOutlined rev/>],
  ['stepbackwardoutlined', <StepBackwardOutlined rev/>],
  ['minuscircleoutlined', <MinusCircleOutlined rev/>],
  ['plusoutlined', <PlusOutlined rev/>],
  ['checkoutlined', <CheckOutlined rev/>],
  ['profileoutlined', <ProfileOutlined rev/>],
  ['stepsforwardoutlined', <StepForwardOutlined rev/>],
  ['stepsbackwardoutlined', <StepBackwardOutlined rev/>],
  ['loadingoutlined', <LoadingOutlined rev/>],
  ['buildoutlined', <BuildOutlined rev/>],
  ['likeoutlined', <LikeOutlined rev/>],
  ['fullscreenoutlined', <FullscreenOutlined rev/>],
  ['enteroutlined', <EnterOutlined rev/>],
  ['insertrowaboveoutlined', <InsertRowAboveOutlined rev/>],
  ['insertrowbelowoutlined', <InsertRowBelowOutlined rev/>],
  ['deleterowoutlined', <DeleteRowOutlined rev/>],
  ['closecircleoutlined', <CloseCircleOutlined rev/>],
  ['searchoutlined',<SearchOutlined rev/>],
  ['formoutlined',<FormOutlined rev/>],
  ['fontsizeoutlined',<FontSizeOutlined rev/>],
  ['searchoutlined', <SearchOutlined rev/>],
  ['forwardoutlined', <ForwardOutlined rev/>],
  ['fileexceloutlined',<FileExcelOutlined rev/>]
  ]);

function getIcon(id?: string, defaultid?: string): ReactNode {
  if (id === undefined && defaultid === undefined) {
    internalinfoerrorlog("getIcon", "both paraneters are undefined", false);
    return <QuestionOutlined rev/>;
  }
  const iid: string = id ? id : (defaultid as string);
  const i: ReactNode | undefined = map.get(id ? id : (defaultid as string));
  if (i) return i
  internalinfoerrorlog("getIcon", `${iid} does not exist`, false);
  return <QuestionOutlined rev />;
}

export default getIcon;
