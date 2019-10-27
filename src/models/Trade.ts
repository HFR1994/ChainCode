const uuidv4 = require('uuid/v4');
import {Rate} from './Rate';

export class Trade {
    public reference: string;
    public date: string;
    public time: string;
    public rate: Rate;
    public amount: number;
    public owed: number;
    public owner: string;
    public doctype: string;

    constructor() {
        this.reference = uuidv4();
        this.date = new Date().toUTCString().substring(0, 16);
        this.time = new Date().toUTCString().substring(18);
    }
}
