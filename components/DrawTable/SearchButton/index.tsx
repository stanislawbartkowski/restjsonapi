import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Tooltip } from "antd";
import { BaseButtonProps } from "antd/lib/button/button";
import React, { MutableRefObject, useRef, useState } from "react";

import lstring from '../../../ts/localize';
import SearchExtended, { SearchButtonType, IIRefCall, ExtendedFilter } from './SearchExtended'
import { TRow } from "../../../ts/typing";
import { FOnValuesChanged } from "../../ts/typing";
import DraggableModal from "../../DraggableModal"
import getIcon from "../../../ts/icons";

export type FSetFilter = (t: ExtendedFilter) => void
export type FSetSearch = (t: ExtendedFilter, first: boolean) => void

function isFilterSetEmpty(p: TRow): boolean {
  if (p === undefined) return true;
  let empty: boolean = true;
  for (let v in p)
    if (p[v]) empty = false
  return empty
}

const SearchButton: React.FC<SearchButtonType & { refreshFilter: FSetFilter, searchRow: FSetSearch }> = (props) => {

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [refreshnumber, setRefreshNumber] = useState<number>(0);
  const ref: MutableRefObject<IIRefCall> = useRef<IIRefCall>() as MutableRefObject<IIRefCall>


  const isFilterEmpty: boolean = isFilterSetEmpty(ref.current ? ref.current.getValues() : props.filtervalues)

  function onCancel() {
    setIsModalVisible(false)
  }

  function searchRow() {
    const v: TRow = ref.current.getValues()
    props.searchRow({ isfilter: true, filtervalues: v }, true)

  }

  function searchRowNext() {
    const v: TRow = ref.current.getValues()
    props.searchRow({ isfilter: true, filtervalues: v }, false)
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
    setRefreshNumber(refreshnumber + 1)
  }


  const primary: BaseButtonProps = props.isfilter ? { type: "primary" } : { type: "text" }

  const closeicon = getIcon('closecircleoutlined')

  const closeButton: React.ReactNode = !isModalVisible && props.isfilter ? <Tooltip title={lstring("removefilter")}>
    <Button icon={closeicon} size="small" type="text" onClick={closeFilter} /> </Tooltip> :
    undefined

  const buttons: React.ReactNode[] = [
    <Button key="search" disabled={isFilterEmpty} onClick={searchRow}>{lstring("search")}</Button>,
    <Button key="searchnext" disabled={isFilterEmpty} onClick={searchRowNext}>{lstring("searchnext")}</Button>,
    <Divider type="vertical" />,
    <Button key="filter" disabled={isFilterEmpty} onClick={setFilterNotClose}>{lstring("filter")}</Button>,
    <Button key="reset" disabled={isFilterEmpty} onClick={closeFilter}>{lstring("reset")}</Button>,
    <Button key="filterclose" disabled={isFilterEmpty} type="primary" onClick={setFilter}>{lstring("filterclose")}</Button>,
    <Divider type="vertical" />,
    <Button key="cancel" onClick={onCancel}>{lstring("cancelaction")}</Button>,
  ]

  const searchicon = getIcon('searchoutlined')

  return <React.Fragment>
    <Tooltip placement="bottom" title={lstring("searchextended")}><Button icon={searchicon} size="small" {...primary} onClick={() => setIsModalVisible(true)} /> </Tooltip>
    {closeButton}
    <DraggableModal open={isModalVisible} onClose={onCancel} onOk={setFilter} buttons={null} title={lstring('searchfiltertitle')}>
      <SearchExtended ref={ref} {...props} onValuesChanges={onValuesChanges} buttons={buttons} />
    </DraggableModal>

  </React.Fragment>


}

export default SearchButton;