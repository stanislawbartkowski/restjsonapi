import { restapiresource } from '../services/api'
import { log } from '../ts/j'
import { setStrings } from './localize'

export async function readResource() {

  const strings: any = await restapiresource('strings')
  log('Resource strings read');
  setStrings(strings);
  const leftmenu: any = await restapiresource('leftmenu')
  log('Resource leftmenu read');
  const appdata: any = await restapiresource('appdata')
  log('Resource appdata read');
}
