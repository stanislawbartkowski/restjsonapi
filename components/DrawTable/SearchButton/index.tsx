import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip } from "antd";
import { BaseButtonProps } from "antd/lib/button/button";
import React, { MutableRefObject, useRef, useState } from "react";

import lstring from '../../../ts/localize';
import SearchExtended, { SearchButtonType, IIRefCall, ExtendedFilter } from './SearchExtended'
import { TRow } from "../../../ts/typing";
import { FOnValuesChanged } from "../../ModalForm/ModalFormView";

export type FSetFilter = (t: ExtendedFilter) => void

function isFilterSetEmpty(p: TRow): boolean {
  if (p === undefined) return true;
  let empty: boolean = true;
  for (let v in p)
    if (p[v]) empty = false
  return empty
}

const SearchButton: React.FC<SearchButtonType & { refreshFilter: FSetFilter }> = (props) => {

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isFilterEmpty, setIsFilterEmpty] = useState<boolean>(isFilterSetEmpty(props.filtervalues))
  const ref: MutableRefObject<IIRefCall> = useRef<IIRefCall>() as MutableRefObject<IIRefCall>

  function onCancel() {
    setIsModalVisible(false)
  }

  function setFilter() {
    const v: TRow = ref.current.getValues()
    props.refreshFilter({ isfilter: true, filtervalues: v });
    setIsModalVisible(false)
  }

  function closeFilter() {
    props.refreshFilter({ isfilter: false, filtervalues: {} });
    setIsModalVisible(false)
  }

  function setFilterNotClose() {
    const v: TRow = ref.current.getValues()
    props.refreshFilter({ isfilter: true, filtervalues: v });
  }

  const onValuesChanges: FOnValuesChanged = (changedFields: Record<string, any>, p: Record<string, any>) => {
    const v: TRow = ref.current.getValues()
    setIsFilterEmpty(isFilterSetEmpty(v));
  }


  const primary: BaseButtonProps = props.isfilter ? { type: "primary" } : { type: "text" }

  const closeButton: React.ReactNode = !isModalVisible && props.isfilter ? <Tooltip title={lstring("removefilter")}>
    <Button icon={<CloseCircleOutlined />} size="small" type="text" onClick={closeFilter} /> </Tooltip> :
    undefined

  const buttons: React.ReactNode[] = [
    <Button key="search" disabled={isFilterEmpty} onClick={setFilterNotClose}>{lstring("search")}</Button>,
    <Button key="reset" disabled={isFilterEmpty} onClick={closeFilter}>{lstring("reset")}</Button>,
    <Button key="cancel" onClick={onCancel}>{lstring("cancelaction")}</Button>,
    <Button key="searchclose" disabled={isFilterEmpty} type="primary" onClick={setFilter}>{lstring("searchclose")}</Button>,
  ]

  return <React.Fragment>
    <Tooltip title={lstring("searchextended")}><Button icon={<SearchOutlined />} size="small" {...primary} onClick={() => setIsModalVisible(true)} /> </Tooltip>
    {closeButton}
    <Modal visible={isModalVisible} onCancel={onCancel} onOk={setFilter} destroyOnClose footer={buttons}>
      <SearchExtended ref={ref} {...props} onValuesChanges={onValuesChanges} />
    </Modal>

  </React.Fragment>


}

export default SearchButton;