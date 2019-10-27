const uuidv4 = require('uuid/v4');

export class Client {
    public country: string;
    public zipCode: string;
    public birthdate: string;
    public gender: boolean;
    public ethnicity: string;
    public owesMoney: boolean;
    public civilStatus: string;
    public wallets: any;
    public uuid: string;
    public memberSince: string;
    public owner: string;
    public doctype: string;

    constructor() {
        this.owesMoney = false;
        this.wallets = [];
        this.uuid = uuidv4();
        this.memberSince = new Date().toUTCString();
    }
}
