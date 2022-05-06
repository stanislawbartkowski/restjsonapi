import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem} from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'

async function init() {
    await readResource();
    addRouterElem(defaults.displayprintrouterid,<PrintDisplay/>)
}

export default init