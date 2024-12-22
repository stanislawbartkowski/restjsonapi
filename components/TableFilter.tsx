import { SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Space } from "antd";
import dayjs from 'dayjs';
import { FilterConfirmProps, FilterDropdownProps } from "antd/lib/table/interface";

import type { IColumnFilter, TColumn } from './ts/typing'
import { FIELDTYPE } from '../ts/typing'
import lstring from '../ts/localize'
import defaults from '../ts/defaults'
import { datetoS, dateparseS } from '../ts/d'
import type { TRow } from '../ts/typing'
import { Key, ReactNode } from "react";
import { internalerrorlog } from "../ts/l";
import { fieldType } from "./ts/transcol";
import { toS } from "../ts/j";
import { valueType } from "antd/es/statistic/utils";

// ========================
// filter/search
// ========================

export type ColumnFilterSearch = {
  defaultFilteredValue: string[] | undefined
  filterDropdown: (props: FilterDropdownProps) => ReactNode
  filterIcon: (filtered: boolean) => ReactNode
  onFilter: (value: boolean | Key, record: TRow) => boolean;
  onFilterDropdownVisibleChange?: (visible: boolean) => void
}



function eqString(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined || row[field] === null) return false
  const f: string = toS(row[field])
  return f.toString().toUpperCase().indexOf(filter.toUpperCase()) !== -1;
}

function eqNumber(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined || row[field] === null) return false
  const fieldnum: number = +(row[field] as string | number)
  const res: boolean = fieldnum === +filter
  return res
}

function eqBoolean(row: TRow, field: string, filter: boolean): boolean {
  if (row === undefined || row[field] === undefined || row[field] === null) return false
  const fieldbool: boolean = (row[field] as boolean)
  return fieldbool === filter
}


export type FFilter = (value: Key | boolean, record: TRow) => boolean

export function constructTableFilter(c: TColumn): FFilter {

  const t: FIELDTYPE = fieldType(c);

  const filtercol: string = c.coltosort === undefined ? c.field : c.coltosort

  switch (t) {
    case FIELDTYPE.NUMBER:
    case FIELDTYPE.INT:
    case FIELDTYPE.MONEY: return (value: Key | boolean, record: TRow) => eqNumber(record, filtercol, value as string);
    case FIELDTYPE.STRING:
    case FIELDTYPE.DATE:
    case FIELDTYPE.TIME:
      return (value: Key | boolean, record: TRow) => eqString(record, filtercol, value as string);
    case FIELDTYPE.BOOLEAN:
      return (value: Key | boolean, record: TRow) => eqBoolean(record, filtercol, value as boolean);
    default:
      internalerrorlog(`No filter function supported for this type: ${t} !`)
      return (value: Key | boolean, record: TRow) => true;
  }
}


function searchAttr(c: TColumn, coltitle: string, filterF?: IColumnFilter): ColumnFilterSearch {

  const state = {
    searchText: '',
  };

  const setState = (statep: any) => {
    state.searchText = statep.searchText;
  }

  const handleSearch = (selectedKeys: any[], confirm: { (param?: FilterConfirmProps | undefined): void; (param?: FilterConfirmProps | undefined): void; (param?: FilterConfirmProps | undefined): void; (): void; }, dataIndex: string) => {
    confirm();
    setState({
      searchText: selectedKeys[0],
    });
    if (selectedKeys.length === 0) handleSetFilter(undefined)
    else handleSetFilter(selectedKeys[0])
  }

  function handleSetFilter(val: string | undefined) {
    if (filterF === undefined) return
    filterF.setFilter(c, val)
  }

  const handleReset = (clearFilters: (() => void)) => {
    clearFilters();
    setState({ searchText: '' });
    handleSetFilter(undefined)
  };


  const SearchInput: React.FC<FilterDropdownProps> = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    switch (c.fieldtype) {
      case FIELDTYPE.DATE: {
        const d: dayjs.Dayjs | undefined = selectedKeys[0] ? dateparseS(selectedKeys[0].toString()) : undefined
        return <DatePicker mode='date' format={defaults.dateformat}
          placeholder={lstring('searchprompt', coltitle)}
          value={d}
          onChange={
            e => {
              const s: string | undefined = datetoS(e as dayjs.Dayjs)
              setSelectedKeys(e ? [s as string] : [])
            }
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
      }

      case FIELDTYPE.NUMBER:
        return <InputNumber
          placeholder={lstring('searchprompt', coltitle)}
          value={selectedKeys[0] as valueType}
          onChange={e => setSelectedKeys(e ? [e] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, c.field)}
          style={{ marginBottom: 8, display: 'block', width: '90%' }}

        />
      default: break;
    }
    return <Input
      placeholder={lstring('searchprompt', coltitle)}
      value={selectedKeys[0] as valueType}
      onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() => handleSearch(selectedKeys, confirm, c.field)}
      style={{ marginBottom: 8, display: 'block' }}
    />
  }

  const fValue: string | undefined = filterF !== undefined ? filterF.getFilter(c) : undefined

  const filterV: string[] | undefined = fValue === undefined ? undefined : [fValue]

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <SearchInput close={() => { }} visible prefixCls='' setSelectedKeys={setSelectedKeys} selectedKeys={selectedKeys} confirm={confirm} clearFilters={clearFilters} />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, c.field)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {lstring('filter')}
          </Button>
          <Button onClick={() => { handleReset(clearFilters as () => {}); handleSearch([], confirm, c.field) }} size="small" style={{ width: 90 }}>
            {lstring('reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,

    onFilter: constructTableFilter(c),

    defaultFilteredValue: filterV

  }
};


export default searchAttr;
