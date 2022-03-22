import React from 'react';
import { Modal } from 'antd';

import type { ModalListProps } from './typing'
import RestTable from '../RestTable'

const ModalList: React.FC<ModalListProps> = (props) => {

  return <Modal destroyOnClose visible={props.visible} maskClosable={false}
    onOk={props.closehook} onCancel={props.closehook} {...props.props} footer={null} >
    <RestTable {...props} />
  </Modal >
}

export default ModalList
