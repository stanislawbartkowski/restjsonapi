import React from 'react';
import { Modal } from 'antd';

import type { ModalListProps, ModalDialogProps } from './typing'
import RestTable from '.'
import ModalDialog from './ModalDialog'
import { getComponent } from './complist';

const ModalTableList: React.FC<ModalListProps> = (props) => {

  function onClose(): void {
    if (props.closeModal) props.closeModal()
  }

  return <Modal destroyOnClose visible={props.visible} maskClosable={false}
    onOk={onClose} onCancel={onClose} footer={null} {...props.props}>
    <RestTable {...props} />
  </Modal >
}


const ModalList: React.FC<ModalDialogProps> = (props) => {

  if (props.component) {
    const comp: React.FC<ModalDialogProps> = getComponent(props.component)
    return comp({ ...props })
  }
  if (props.list) return <ModalTableList {...props} />
  return <ModalDialog {...props} />
}

export default ModalList
