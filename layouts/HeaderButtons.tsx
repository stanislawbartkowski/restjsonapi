
import { blue, cyan, green, yellow, gold, purple } from '@ant-design/colors';
import { Button, Divider, Space } from 'antd';
import { HeaderMenu, getHeaderMenu } from '../ts/headermenu';
import { Fragment } from 'react';

const colors: string[] = [blue[1], cyan[1], green[1], gold[1]]

function genButton(m: HeaderMenu, n: number) {
    return <Button href={m.url} style={{ backgroundColor: colors[n % colors.length], borderColor: colors[n % colors.length] }}>{m.name}</Button>
}


const HeaderButtons: React.FC = () => {

    const menu: HeaderMenu[] | undefined = getHeaderMenu()

    if (menu === undefined) return <div></div>

    let n: number = 0

    const buttons = menu === undefined ? undefined : <Fragment> <Divider type="vertical" /> <Space size="large">{menu.map(m => genButton(m, n++))}</Space></Fragment>

    return <Fragment>{buttons}</Fragment>

}

export default HeaderButtons
