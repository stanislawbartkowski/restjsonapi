import React from 'react';
import { Modal } from 'antd';

import RestTable from './RestTable'
import ModalForm from './ModalForm'
import { getComponent } from './ts/complist';
import { TComponentProps } from '../ts/typing';
import { isAuthenticated } from '../ts/keyclock';
import { erralert, log } from '../ts/l';
import lstring from '../ts/localize';
import DraggableModal from './DraggableModal'

const ModalTableList: React.FC<TComponentProps> = (props) => {

  function onClose(): void {
    if (props.closeAction) props.closeAction()
  }

  if (props.ispage) return <RestTable {...props} />
  else
//    return <Modal destroyOnClose visible={props.visible} maskClosable={false}
//      onOk={onClose} onCancel={onClose} footer={null} {...props.modalprops}>
//      <RestTable {...props} />
//    </Modal >
  return <DraggableModal open={props.visible as boolean}
        onOk={onClose} onClose={onClose} buttons={null} modalprops={props.modalprops}>
        <RestTable {...props} />
      </DraggableModal>
}


const RestComponent: React.FC<TComponentProps> = (props) => {

  const auth = isAuthenticated()
  //log("auth=" + auth)

  if (!auth) {
    const errmess : string = lstring("youarenotauthorized")
    erralert(errmess)
    return <h1>{errmess}</h1>
  }

  if (props.component) {
    const comp: React.FC<TComponentProps> = getComponent(props.component)
    return comp({ ...props })
  }
  if (props.list) return <ModalTableList {...props} />
  return <ModalForm {...props} />
}

export default RestComponent
