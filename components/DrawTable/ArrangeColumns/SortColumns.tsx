import { MenuOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { ColumnsT, ColumnT, SortProps } from '../typing';
import { getAppData } from '../../../ts/readresource';
import { AppData } from '../../../ts/typing';
import { istrue } from '../../ts/helper';

const columnswithid: ColumnsType<ColumnT> = [
  {
    key: 'sort',
  },
  {
    title: "Id",
    dataIndex: "key"
  },
  {
    title: 'Title',
    dataIndex: 'title',
  },
];

const columns: ColumnsType<ColumnT> = [
  {
    key: 'sort',
  },
  {
    title: 'Title',
    dataIndex: 'title',
  },
];


interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 })?.replace(
      /translate3d\(([^,]+),/,
      'translate3d(0,',
    ),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

function initKeys(cols: ColumnsT): React.Key[] {
  return cols.filter(c => c.included).map(c => c.key)
}

function combineColsKeys(p: ColumnsT, k: React.Key[]): ColumnsT {
  const setK: Set<React.Key> = new Set<React.Key>(k);
  return p.map(c => {
    return { ...c, included: setK.has(c.key) }
  }
  )
}

const SortColumns: React.FC<SortProps> = (props) => {
  const [dataSource, setDataSource] = useState<ColumnsT>(props.cols)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(initKeys(props.cols));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous) => {
        const activeIndex = previous.findIndex((i) => i.key === active.id);
        const overIndex = previous.findIndex((i) => i.key === over?.id);
        const d: ColumnsT = arrayMove(previous, activeIndex, overIndex);
        props.colshook(combineColsKeys(d, selectedRowKeys))
        return d
      });
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    props.colshook(combineColsKeys(dataSource, newSelectedRowKeys))
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const a: AppData = getAppData()

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={dataSource.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          rowSelection={rowSelection}
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="key"
          columns={istrue(a.showidcolums) ? columnswithid : columns}
          dataSource={dataSource}
          pagination={false}
        />
      </SortableContext>
    </DndContext>
  );
};

export default SortColumns;