import {SolidLib} from './SolidLib'

async function addPolicy() {
    const solidLib = new SolidLib("fadmin-App");
    await solidLib.login()
    await solidLib.addPolicy("something")
}

addPolicy()
