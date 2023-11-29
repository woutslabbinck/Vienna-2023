import { AdminInterface } from "./src/Admin/AdminServer"

const adminInterfacePort = 8060
const authZInterfacePort = 8050

const adminInterface = new AdminInterface()
// const authZInterface = //TODO:
adminInterface.start(8060)