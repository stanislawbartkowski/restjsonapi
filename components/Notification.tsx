import { notification } from 'antd'
import { NotificationKind, TNotification } from './ts/typing'

import type { OneRowData } from '../ts/typing'
import { makeMessage } from './ts/helper'


const openNotification = (t: TNotification, pars: OneRowData) => {
    const content = {
        message: makeMessage(t.title, pars),
        description: makeMessage(t.description, pars)

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
