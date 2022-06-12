import { notification } from 'antd'
import React from 'react';

import { NotificationKind, TNotification } from './ts/typing'

import type { OneRowData } from '../ts/typing'
import { makeMessage } from '../ts/j'


const openNotification = (t: TNotification, pars: OneRowData) => {
    const descr: string = makeMessage(t.description, pars) as string
    const body : React.ReactNode = t.ishtml ? <div dangerouslySetInnerHTML={{ __html: descr }} /> : descr

    const content = {
        message: makeMessage(t.title, pars),
        description: body
    }
    if (t.kind)
        switch (t.kind) {
            case NotificationKind.ERROR: notification.error({ ...content }); return;
            case NotificationKind.INFO: notification.info({ ...content }); return;
            case NotificationKind.SUCCESS: notification.success({ ...content }); return;
            case NotificationKind.WARN: notification.warn({ ...content }); return;
            case NotificationKind.WARNING: notification.warning({ ...content }); return;
        }
    notification.open({ ...content })
}

export default openNotification
