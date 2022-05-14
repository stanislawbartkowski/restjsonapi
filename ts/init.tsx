import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem} from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'
import { getPagePort, setHost } from '../services/api'

async function init(hostname : string) {
    const PORT = await getPagePort()
    console.log(PORT)
    setHost(`http://${hostname}:${PORT}`);
    await readResource();
    addRouterElem(defaults.displayprintrouterid,<PrintDisplay/>)
}

export default init