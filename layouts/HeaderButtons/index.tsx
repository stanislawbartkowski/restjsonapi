import defaults from "../../ts/defaults"
import { getHeaderMenu } from "../../ts/headermenu"
import HeaderButtonsButtons from "./HeaderButtonsButtons"
import HeaderButtonsDown from "./HeaderButtonsDown"

const HeaderButtons: React.FC = () => {

    if (getHeaderMenu() === undefined) return <div></div>

    return defaults.isheadermenuasmenu ? <HeaderButtonsDown/> : <HeaderButtonsButtons/> 
}

export default HeaderButtons