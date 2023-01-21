import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem} from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'
import { setHost } from '../services/api'
import { getPagePort, isSecEnabled } from '../services/readconf'
import { setSec } from './j'
import { initkeyclock } from './keyclock'

async function init(hostname : string, protocol : string, port : number | undefined) {
    const PORT = (port !== undefined) ? port : await getPagePort()
    console.log(PORT)
    setHost(`${protocol}//${hostname}:${PORT}`);
    await readResource();
    addRouterElem(defaults.displayprintrouterid,<PrintDisplay/>)
    const sec : boolean = await isSecEnabled() 
    setSec(sec)
    await initkeyclock()
}

export default init