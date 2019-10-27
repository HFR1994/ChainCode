import { Context } from 'fabric-contract-api';

export class Utils {

    public static getOwner(ctx: Context): string {
        // tslint:disable-next-line:variable-name
        const _identity = ctx.clientIdentity;
        // tslint:disable-next-line:variable-name
        const _certificate = _identity.getID();
        if (!_certificate) {
            throw new Error('The transaction owner can not be obtained.');
        }
        console.log('Owner is: ', _identity.getX509Certificate().subject.commonName + ' ' + _certificate);
        return _certificate;
    }

    public static async dataExists(ctx: Context, stateraFintechId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(stateraFintechId);
        return (!!buffer && buffer.length > 0);
    }

    public static async getQueryResultForQueryString(ctx: Context, queryString: string) {

        console.info('- getQueryResultForQueryString queryString:\n' + queryString);
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = await this.getAllResults(resultsIterator, false);
        return JSON.parse(Buffer.from(JSON.stringify(results)).toString('utf-8'));
    }

    /**
     *
     * @param iterator
     * @param isHistory
     */
    public static async getAllResults(iterator: any, isHistory?: boolean) {
        console.log('Start: getAllResults');
        const allResults: any[] = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const jsonRes = {
                    TxId: '',
                    Timestamp: '',
                    IsDelete: '',
                    Value: '',
                    Key: '',
                    Record: '',
                };
                if (isHistory) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        console.log(res.value.value.toString('utf8'));
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        console.log(res.value.value.toString('utf8'));
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                await iterator.close();
                console.log('End: getAllResults');
                return allResults;
            }
        }
    }
}
