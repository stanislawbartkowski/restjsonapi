import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";

import type { ColumnFilterSearch, Row, TColumn } from './types'
import { TYPENUMBER } from './types'
import lstring from '../..//ts/localize'


function eqString(row: Row, field: string, filter: string): boolean {
  if (row == undefined || row[field] == undefined) return false
  return row[field].toString().toUpperCase().indexOf(filter.toUpperCase()) != -1;
}

function eqNumber(row: Row, field: string, filter: string): boolean {
  if (row == undefined || row[field] == undefined) return false
  return row[field] as number == +filter
}


function searchAttr(c: TColumn, coltitle: string): ColumnFilterSearch {

  const state = {
    searchText: '',
  };

  const setState = (statep: any) => {
    state.searchText = statep.searchText;
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setState({
      searchText: selectedKeys[0],
    });
  }

  const handleReset = clearFilters => {
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
          <Button onClick={() => { handleReset(clearFilters); handleSearch(selectedKeys, confirm, c.field) }} size="small" style={{ width: 90 }}>
            {lstring('reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,

    onFilter:
      c.fieldtype == TYPENUMBER ? (value: string, record: Row) => eqNumber(record, c.field, value) :
        (value: string, record: Row) => eqString(record, c.field, value)

  }
};


export default searchAttr;
