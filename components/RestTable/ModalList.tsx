import React from 'react';
import { Modal } from 'antd';

import type { ModalListProps } from './typing'
import RestTable from '../RestTable'

const ModalList: React.FC<ModalListProps> = (props) => {

  function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>) : void {
    if (props.closeModal) props.closeModal()
  }

  return <Modal destroyOnClose visible={props.visible} maskClosable={false}
    onOk={onClose} onCancel={onClose} footer={null} >
    <RestTable {...props} />
  </Modal >
}

export default ModalList
