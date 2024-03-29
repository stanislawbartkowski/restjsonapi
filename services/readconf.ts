import { internalerrorlog, log } from "../ts/l";
import { getConfigURL } from "../ts/url";


export async function readR(file : string) : Promise<string> {
    const url: string = await getConfigURL();
    const urll : string = `${url}/${file}`
  
    log(`Fething ${urll}`)
  
    const response = await fetch(urll);
    const data = await response.text()
    log(`Receiving ${data}`)
    return data
}

async function readN(file : string) : Promise<number> {
    const data = +await readR(file)
    if (isNaN(data)) {
      internalerrorlog(`Incorrect value, number expected`)
    }
    return data

}

export async function getDevServer() : Promise<string> {
    return readR('DEVSERVER')
}

export async function isSecEnabled() : Promise<boolean> {
    const num : number = await readN('SECENABLED')
    return num === 1
}  

export async function getkeycloak() : Promise<object> {
    const data : string = await readR('keycloak.json')
    const js: object = JSON.parse(data)
    return js
}  
