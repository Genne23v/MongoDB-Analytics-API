import mongoose, { Connection, Model } from 'mongoose';
import { accountSchema, AccountDocument } from '../models/Account';
import { customerSchema, CustomerDocument } from '../models/Customer';
import { transactionSchema, TransactionDocument } from '../models/Transaction';

export class DB {
    static connection: Connection;
    static accountModel: Model<AccountDocument>;
    static customerModel: Model<CustomerDocument>;
    static transactionModel: Model<TransactionDocument>;

    static initialize(mongoUri: string | undefined) {
        if (!mongoUri) {
            throw new Error('MongoDB URI not provided');
        }

        if (DB.connection) {
            return DB.connection;
        }

        try {
            const connection = mongoose.createConnection(mongoUri);

            DB.connection = connection;

            DB.accountModel = DB.connection.model<AccountDocument>(
                'accounts',
                accountSchema
            );
            DB.customerModel = DB.connection.model<CustomerDocument>(
                'customers',
                customerSchema
            );
            DB.transactionModel = DB.connection.model<TransactionDocument>(
                'transactions',
                transactionSchema
            );

            return connection;
        } catch (error) {
            throw new Error('Failed to connect to MongoDB');
        }
    }

    static getAllAccounts() {
        return DB.accountModel.find();
    }

    static getAccountById(accountId: number) {
        return DB.accountModel.findOne({ account_id: accountId });
    }

    static createAccount(account: AccountDocument) {
        return DB.accountModel.create(account);
    }

    static updateAccount(account: AccountDocument) {
        return DB.accountModel.updateOne({ _id: account._id }, account);
    }

    static deleteAccount(accountId: string) {
        return DB.accountModel.deleteOne({ _id: accountId });
    }

    static getAllCustomers() {
        return DB.customerModel.find();
    }

    static getCustomerById(customerId: string) {
        return DB.customerModel.findOne({ _id: customerId });
    }

    static getCustomerByEmail(email: string) {
        return DB.customerModel.findOne({ email });
    }

    static getCustomersByName(name: string) {
        return DB.customerModel.find({
            name: { $regex: new RegExp(name, 'i') },
        });
    }

    static createCustomer(customer: CustomerDocument) {
        return DB.customerModel.create(customer);
    }

    static updateCustomer(customerId: string, customer: CustomerDocument) {
        return DB.customerModel.updateOne({ _id: customerId }, customer);
    }

    static deleteCustomer(customerId: string) {
        return DB.customerModel.deleteOne({ _id: customerId });
    }

    static getAllTransactions() {
        return DB.transactionModel.find();
    }

    static getTransactionById(transactionId: string) {
        return DB.transactionModel.findOne({ _id: transactionId });
    }

    static async getCustomerAccounts(customerId: string) {
        const customer = await DB.customerModel.findOne({ _id: customerId });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return DB.accountModel.find({
            account_id: { $in: customer.accounts },
        });
    }

    static async getAllProducts() {
        const accounts = await DB.accountModel.find();

        const allProducts = accounts.reduce<string[]>((products, account) => {
            return products.concat(account.products);
        }, []);

        return [...new Set(allProducts)];
    }

    static async getCustomerTransactions(customerId: string) {
        const customer = await DB.customerModel.findOne({ _id: customerId });

        if (!customer) {
            throw new Error('Customer not found');
        }

        const transactions = await DB.transactionModel.aggregate([
            {
                $match: {
                    account_id: { $in: customer.accounts },
                },
            },
            {
                $group: {
                    _id: '$account_id',
                    totalTransactionCount: { $sum: '$transaction_count' },
                    transactions: { $push: '$transactions' },
                },
            },
        ]);

        return { transactions, customer };
    }

    static getCustomersWithMostTransactions() {
        return DB.customerModel.aggregate([
            {
                $unwind: '$accounts',
            },
            {
                $lookup: {
                    from: 'transactions',
                    localField: 'accounts',
                    foreignField: 'account_id',
                    as: 'accountTransactions',
                },
            },
            {
                $unwind: '$accountTransactions',
            },
            {
                $group: {
                    _id: '$_id',
                    username: { $first: '$username' },
                    totalTransactionCount: {
                        $sum: '$accountTransactions.transaction_count',
                    },
                    transactions: {
                        $push: '$accountTransactions',
                    },
                },
            },
            {
                $sort: {
                    totalTransactionCount: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
    }

    static getAllTransactionAmounts(
        startDate: Date | null,
        endDate: Date | null
    ) {
        return DB.transactionModel.aggregate([
            {
                $unwind: '$transactions',
            },
            {
                $addFields: {
                    totalAsDouble: { $toDouble: '$transactions.total' },
                },
            },
            ...(startDate && endDate
                ? [
                      {
                          $match: {
                              'transactions.date': {
                                  $gte: startDate,
                                  $lte: endDate,
                              },
                          },
                      },
                  ]
                : []),
            {
                $group: {
                    _id: '$transactions.transaction_code',
                    totalAmount: {
                        $sum: '$transactions.amount',
                    },
                    priceTotal: {
                        $sum: '$totalAsDouble',
                    },
                },
            },
        ]);
    }
}
