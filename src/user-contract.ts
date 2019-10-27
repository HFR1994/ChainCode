import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Utils } from './lib/Utils';
import { Client } from './models/Client';
import { Organization } from './models/Organization';
import {Rate} from './models/Rate';
import {Trade} from './models/Trade';
import { Wallet } from './models/Wallet';

@Info({title: 'UserContract', description: 'My User Smart Contract' })
export class UserContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async userExists(ctx: Context, uuid: string): Promise<Client|Organization> {
        const userBytes: Buffer = await ctx.stub.getState(uuid);

        if (!!userBytes && userBytes.length > 0) {
                return JSON.parse(userBytes.toString());
        } else {
                return null;
        }
    }

    @Transaction()
    public async updateWallet(ctx: Context, wallet: Wallet): Promise<void> {
        await this.queryClientOwner(ctx, Utils.getOwner(ctx)).then((user) => {
            if (user) {
                const current = user.wallets.findIndex((old) => {
                    return old.issuer === wallet.issuer;
                });

                if (current !== -1) {
                    user.wallets[current] = wallet;
                } else {
                    user.wallets.push(wallet);
                }
                ctx.stub.putState(user.uuid, Buffer.from(JSON.stringify(user)));
            } else {
                throw new Error('User dosen\'t exist');
            }
        });
    }

    @Transaction()
    public async registerUser(ctx: Context, userData: string): Promise<void> {
        const user = JSON.parse(userData);
        let register: (Client|Organization);

        if (user && user.rfc) {
            register = Object.setPrototypeOf(
                user,
                Organization.prototype,
            );
            register.owner = Utils.getOwner(ctx);
            register.doctype = 'Organization';
        } else if (user && user.gender) {
            register = Object.setPrototypeOf(
                user,
                Client.prototype,
            );
            register.owner = Utils.getOwner(ctx);
            register.doctype = 'Client';
        } else {
            throw new Error('Register cannot be null');
        }

        await this.queryRegisterOwner(ctx, user.owner).then((res) => {
            if (res) {
                ctx.stub.putState(user.uuid, Buffer.from(JSON.stringify(user)));
            } else {
                throw new Error('Identity already register someone');
            }
        });
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryClientOwner(ctx: Context, owner: string): Promise<Client> {
        const queryString = {
            selector: {
                doctype: 'Client',
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    @Returns('boolean')
    public async organizationExists(ctx: Context, uuid: string): Promise<Organization> {
        const OrganizationBytes: Buffer = await ctx.stub.getState(uuid);

        if (!!OrganizationBytes && OrganizationBytes.length > 0) {
            return JSON.parse(OrganizationBytes.toString());
        } else {
            return null;
        }
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryOrganizationOwner(ctx: Context, owner: string): Promise<Organization> {
        const queryString = {
            selector: {
                doctype: 'Organization',
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryOrganizationProperty(ctx: Context, owner: string, rfc: string): Promise<Organization> {
        const queryString = {
            selector: {
                doctype: 'Organization',
                owner,
                rfc,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction()
    public async updateRates(ctx: Context, origin: string, rate: Rate): Promise<void> {
        await this.organizationExists(ctx, origin).then((organization) => {
            if (organization) {

                const current = organization.exchangeRate.findIndex((old) => {
                    return old.issuer === rate.issuer;
                });

                if (current !== -1) {
                    organization.exchangeRate[current] = rate;
                } else {
                    organization.exchangeRate.push(rate);
                }
                ctx.stub.putState(organization.name, Buffer.from(JSON.stringify(organization)));
            } else {
                throw new Error('User dosen\'t exist');
            }
        });
    }

    @Transaction()
    public async registerOrganization(ctx: Context, data: string): Promise <void> {
        const rawData = JSON.parse(data);
        let dataMap: (Organization);

        if (rawData) {
            dataMap = Object.setPrototypeOf(
                rawData,
                Organization.prototype,
            );
            dataMap.owner = Utils.getOwner(ctx);
            dataMap.doctype = 'Organization';
        } else {
            throw new Error('Organization cannot be null');
        }

        if (this.organizationExists(ctx, dataMap.name)) {
            ctx.stub.putState(dataMap.name, Buffer.from(JSON.stringify(dataMap)));
        } else {
            throw new Error('Organization already registered');
        }
    }

    @Transaction(false)
    @Returns('boolean')
    public async TradeExists(ctx: Context, uuid: string): Promise<Trade> {
        const TradeBytes: Buffer = await ctx.stub.getState(uuid);

        if (!!TradeBytes && TradeBytes.length > 0) {
            return JSON.parse(TradeBytes.toString());
        } else {
            return null;
        }
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryRegisterOwner(ctx: Context, owner: string): Promise<Trade> {
        const queryString = {
            selector: {
                doctype: 'Trade',
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryTradeProperty(ctx: Context, owner: string, reference: string): Promise<Trade> {
        const queryString = {
            selector: {
                doctype: 'Trade',
                owner,
                reference,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryDateProperty(ctx: Context, owner: string, date: string): Promise<Trade> {
        const queryString = {
            selector: {
                date,
                doctype: 'Trade',
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction()
    public async registerTrade(ctx: Context, data: string): Promise<void> {
        const rawData = JSON.parse(data);

        if (rawData.issuer) {

            this.queryClientOwner(ctx, Utils.getOwner(ctx)).then(async (user) => {
                const current: number = user.wallets.findIndex((old) => {
                    return old.issuer === ctx.clientIdentity.getX509Certificate().subject.commonName;
                });

                const added: number = user.wallets.findIndex((old) => {
                    return old.issuer === rawData.issuer;
                });

                const organization = await this.organizationExists(ctx, rawData.issuer);

                const exchangeRate: Rate = organization.exchangeRate.find((old) => {
                    return old.issuer === ctx.clientIdentity.getX509Certificate().subject.commonName;
                });

                if (current !== -1 && added !== -1 && exchangeRate) {
                    user.wallets[current].points = user.wallets[current].points - rawData.points;
                    user.wallets[added].points = user.wallets[added].points + rawData.points;
                    ctx.stub.putState(user.uuid, Buffer.from(JSON.stringify(user)));
                } else {
                    throw new Error('No exchange rate has been established');
                }

                const trade = new Trade();
                trade.amount = rawData.points;
                trade.rate = exchangeRate;
                trade.owed = rawData.issuer;
                ctx.stub.putState(trade.reference, Buffer.from(JSON.stringify(trade)));
            });

        }
    }

    @Transaction(false)
    @Returns('boolean')
    public async WalletExists(ctx: Context, uuid: string): Promise<Wallet> {
        const WalletBytes: Buffer = await ctx.stub.getState(uuid);

        if (!!WalletBytes && WalletBytes.length > 0) {
            return JSON.parse(WalletBytes.toString());
        } else {
            return null;
        }
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryWalletOwner(ctx: Context, owner: string): Promise<Wallet> {
        const queryString = {
            selector: {
                doctype: 'Wallet',
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    @Returns('boolean')
    public async queryWalletProperty(ctx: Context, owner: string, issuer: string): Promise<Wallet> {
        const queryString = {
            selector: {
                doctype: 'Wallet',
                issuer,
                owner,
            },
        };
        return await Utils.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction()
    public async registerWallet(ctx: Context, data: string): Promise<void> {
        const rawData = JSON.parse(data);
        let dataMap: (Wallet);

        if (rawData) {
            dataMap = Object.setPrototypeOf(
                rawData,
                Wallet.prototype,
            );
            dataMap.owner = Utils.getOwner(ctx);
            dataMap.doctype = 'Wallet';
        } else {
            throw new Error('Wallet cannot be null');
        }

        if (this.queryWalletProperty(ctx, dataMap.owner, dataMap.issuer)) {
            ctx.stub.putState(dataMap.uuid, Buffer.from(JSON.stringify(dataMap)));
        } else {
            throw new Error('Wallet already registered');
        }
    }
}
