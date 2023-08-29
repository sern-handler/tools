import {composable, useMutableState} from "../src/index";
import {fromEvent} from "rxjs";
import {EventEmitter} from "events";


//hypothetical EventEmitter
declare const ee : EventEmitter

const [str, setData, manager] = useMutableState("root")
const messageCreate = fromEvent(ee, 'messageCreate')

composable<string>((close, message) => {

    if(message === "!ping") {
        setData(message)
    }

},[messageCreate])
