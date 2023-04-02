import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem} from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'
import { setHost } from '../services/api'
import { isSecEnabled } from '../services/readconf'
import { getServerUrl, setSec } from './j'
import { initkeyclock } from './keyclock'

async function init() {
    const serverURL: string = await getServerUrl()
    console.log(`Server URL ${serverURL}`)
    setHost(serverURL)
    await readResource();
    addRouterElem(defaults.displayprintrouterid,<PrintDisplay/>)
    const sec : boolean = await isSecEnabled() 
    setSec(sec)
    await initkeyclock()
}

export default init