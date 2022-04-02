import { SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Space } from "antd";
import type { Moment } from 'moment'

import type { ColumnFilterSearch, TColumn } from './typing'
import { FIELDTYPE } from '../../ts/typing'
import lstring from '../..//ts/localize'
import { FilterConfirmProps, FilterDropdownProps } from "antd/lib/table/interface";
import defaults from '../../ts/defaults'
import { datetoS, dateparseS } from '../../ts/d'
import type { TRow } from '../../ts/typing'



function eqString(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined) return false
  return (row[field] as string).toString().toUpperCase().indexOf(filter.toUpperCase()) !== -1;
}

function eqNumber(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined) return false
  const fieldnum: number = +(row[field] as string | number)
  const res: boolean = fieldnum === +filter
  return res
}


function searchAttr(c: TColumn, coltitle: string): ColumnFilterSearch {

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
  }

  const handleReset = (clearFilters: (() => void)) => {
    clearFilters();
    setState({ searchText: '' });
  };


  const SearchInput: React.FC<FilterDropdownProps> = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    switch (c.fieldtype) {
      case FIELDTYPE.DATE: {
        const d: Moment | undefined = selectedKeys[0] ? dateparseS(selectedKeys[0].toString()) : undefined
        return <DatePicker mode='date' format={defaults.dateformat}
          placeholder={lstring('searchprompt', coltitle)}
          value={d}
          onChange={
            e => {
              const s: string | undefined = datetoS(e as Moment)
              setSelectedKeys(e ? [s as string] : [])
            }
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
      }

      case FIELDTYPE.NUMBER:
        return <InputNumber
          placeholder={lstring('searchprompt', coltitle)}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e ? [e] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, c.field)}
          style={{ marginBottom: 8, display: 'block', width: '90%' }}
        />
      default: break;
    }
    return <Input
      placeholder={lstring('searchprompt', coltitle)}
      value={selectedKeys[0]}
      onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() => handleSearch(selectedKeys, confirm, c.field)}
      style={{ marginBottom: 8, display: 'block' }}
    />
  }

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <SearchInput visible prefixCls='' setSelectedKeys={setSelectedKeys} selectedKeys={selectedKeys} confirm={confirm} clearFilters={clearFilters} />
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
          <Button onClick={() => { handleReset(clearFilters as () => {}); handleSearch(selectedKeys, confirm, c.field) }} size="small" style={{ width: 90 }}>
            {lstring('reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,

    onFilter:
      c.fieldtype === FIELDTYPE.NUMBER ? (value: string | number | boolean, record: TRow) => eqNumber(record, c.field, value as string) :
        (value: string | number | boolean, record: TRow) => eqString(record, c.field, value as string)

  }
};


export default searchAttr;
