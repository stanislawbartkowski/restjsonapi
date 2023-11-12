import React, { useState } from 'react';

import RestTable from './RestTable'
import ModalForm from './ModalForm'
import { getComponent } from './ts/complist';
import { TComponentProps } from '../ts/typing';
import { isAuthenticated } from '../ts/keyclock';
import { erralert } from '../ts/l';
import lstring from '../ts/localize';
import DraggableModal from './DraggableModal'

const ModalTableList: React.FC<TComponentProps> = (props) => {

  function onClose(): void {
    if (props.closeAction) {
      setModalTitle(undefined)
      props.closeAction()
    }
  }

  const [modaltitle, setModalTitle] = useState<string | undefined>(undefined)

  function setTitle(title: string | undefined): void {
    setModalTitle(title)
  }


  if (props.ispage) return <RestTable {...props} />
  else
    return <DraggableModal open={props.visible as boolean} title={modaltitle}
      onOk={onClose} onClose={onClose} buttons={null} modalprops={props.modalprops}>

      <RestTable {...props} setTitle={setTitle} />
    </DraggableModal>
}


const RestComponent: React.FC<TComponentProps> = (props) => {

  const auth = isAuthenticated()
  //log("auth=" + auth)

  if (!auth) {
    const errmess: string = lstring("youarenotauthorized")
    erralert(errmess)
    return <h1>{errmess}</h1>
  }

  if (props.component) {
    const comp: React.FC<TComponentProps> = getComponent(props.component)
    return comp({ ...props })
  }
  if (props.list) return <ModalTableList {...props}/>
  return <ModalForm {...props}/>
}

export default RestComponent
