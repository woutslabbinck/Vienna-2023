import { AdminInterface } from "./src/Admin/AdminServer"
import { AuthZInterface } from "./src/AuthZ/AuthZServer"

const adminInterfacePort = 8060
const authZInterfacePort = 8050

const adminInterface = new AdminInterface()
const authZInterface = new AuthZInterface()
adminInterface.start(adminInterfacePort)
authZInterface.start(authZInterfacePort)