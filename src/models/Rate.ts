export class Rate {
    public date: string;
    public issuer: string;
    public rate: number;
    public accepting: boolean = true;
    public minimum: number;
    public maximum: number;
    public owner: string;
    public doctype: string;

    constructor() {
        this.date = new Date().toUTCString();
    }
}
