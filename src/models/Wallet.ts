const uuidv4 = require('uuid/v4');

export class Wallet {
    public uuid: string;
    public points: number;
    public account: string;
    public issuer: string;
    public owner: string;
    public doctype: string;

    constructor() {
        this.uuid = uuidv4();
    }
}
