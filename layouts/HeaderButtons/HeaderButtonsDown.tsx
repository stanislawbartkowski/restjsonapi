
import { Button, Dropdown, MenuProps } from 'antd';
import { gray } from '@ant-design/colors';

import { HeaderMenu, getHeaderMenu } from '../../ts/headermenu';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import AppLauncherIcon from './AppLauncher'
import defaults from '../../ts/defaults';

function genMenuLabel(m: HeaderMenu, n: number): ItemType<any> {
  return {
    label: (
      <a href={m.url}>
        {m.name}
      </a>
    ),
    type: n
  }
}

const HeaderButtons: React.FC = () => {

  const menu: HeaderMenu[] = getHeaderMenu() as HeaderMenu[]

  const icondown = <AppLauncherIcon />
  let n: number = 0


  const items: MenuProps['items'] = menu.map(m => genMenuLabel(m, n++))


  return <Dropdown menu={{ items }}>
    <Button icon={icondown} style={{ backgroundColor: gray[1], borderColor: gray[2], color: "white" }}>
      {defaults.headermenuname}
    </Button>
  </Dropdown>

}

export default HeaderButtons
