const uuidv4 = require('uuid/v4');

export class Organization {
    public rfc: string;
    public address: string;
    public owesMoney: boolean = false;
    public name: string;
    public exchangeRate: any;
    public uuid: string;
    public memberSince: string;
    public owner: string;
    public doctype: string;

    constructor() {
        this.exchangeRate = [];
        this.uuid = uuidv4();
        this.memberSince = new Date().toUTCString();
    }
}
