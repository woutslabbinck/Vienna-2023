import {SolidLib} from './SolidLib'

async function getData() {
    const solidLib = new SolidLib("food-store");
    await solidLib.login()
    await solidLib.getData("date_of_birth", [
        "verification",
        "advertisement"
    ])
}

async function main(){
    // add policy

    // get Data
    await getData()
}
main()