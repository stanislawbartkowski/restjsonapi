import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";

import type { ColumnFilterSearch, TRow, TColumn } from './typing'
import { FIELDTYPE } from '../../ts/typing'
import lstring from '../..//ts/localize'
import { FilterConfirmProps } from "antd/lib/table/interface";


function eqString(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined) return false
  return row[field].toString().toUpperCase().indexOf(filter.toUpperCase()) !== -1;
}

function eqNumber(row: TRow, field: string, filter: string): boolean {
  if (row === undefined || row[field] === undefined) return false
  const fieldnum: number = +row[field]
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

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={lstring('searchprompt', coltitle)}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, c.field)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, c.field)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {lstring('search')}
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
