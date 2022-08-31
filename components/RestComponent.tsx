import React from 'react';
import { Modal } from 'antd';

import RestTable from './RestTable'
import ModalForm from './ModalForm'
import { getComponent } from './ts/complist';
import { TComponentProps } from '../ts/typing';
import InLine from '../ts/inline';

const ModalTableList: React.FC<TComponentProps> = (props) => {

  function onClose(): void {
    if (props.closeAction) props.closeAction()
  }

  if (props.ispage) return <RestTable {...props} />
  else
    return <Modal destroyOnClose visible={props.visible} maskClosable={false}
      onOk={onClose} onCancel={onClose} footer={null} {...props.modalprops}>
      <RestTable {...props} />
    </Modal >
}


const RestComponent: React.FC<TComponentProps> = (props) => {

  if (props.component) {
    const comp: React.FC<TComponentProps> = getComponent(props.component)
    return comp({ ...props })
  }
  if (props.list) return <ModalTableList {...props} />
  return <ModalForm {...props} />
}

export default RestComponent
