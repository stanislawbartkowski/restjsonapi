import { notification } from 'antd'
import { makeMessage } from './js/helper'
import { NotificationKind, TNotification } from './typing'
import type { TRow } from '../../ts/typing'


const openNotification = (t: TNotification, r: TRow) => {
    const content = {
        message: makeMessage(t.title, r),
        description: makeMessage(t.description, r)

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