import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem} from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'
import { setHost } from '../services/api'
import { getPagePort, isSecEnabled } from '../services/readconf'
import { setSec } from './j'
import { initkeyclock } from './keyclock'

async function init(hostname : string) {
    const PORT = await getPagePort()
    console.log(PORT)
    setHost(`http://${hostname}:${PORT}`);
    await readResource();
    addRouterElem(defaults.displayprintrouterid,<PrintDisplay/>)
    const sec : boolean = await isSecEnabled() 
    setSec(sec)
    await initkeyclock()
}

export default init