import React from 'react';
import { Modal } from 'antd';

import type { ModalListProps ,ModalDialogProps } from './typing'
import RestTable from '.'
import ModalDialog from './ModalDialog'

const ModalTableList: React.FC<ModalListProps> = (props) => {

  function onClose(e: React.MouseEvent<HTMLElement, MouseEvent>) : void {
    if (props.closeModal) props.closeModal()
  }

  return <Modal destroyOnClose visible={props.visible} maskClosable={false}
    onOk={onClose} onCancel={onClose} footer={null} >
    <RestTable {...props} />
  </Modal >
}


const ModalList: React.FC<ModalDialogProps> = (props) => {

  if (props.list) return <ModalTableList {...props} />
  return <ModalDialog {...props} />
}

export default ModalList
