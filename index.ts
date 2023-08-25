import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { DB } from './db/db';
dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ message: 'API Listening' });
});

app.get('/accounts', async (req: Request, res: Response) => {
    try {
        const accounts = await DB.getAllAccounts();
        return res.status(200).json(accounts);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/accounts/:id', async (req: Request, res: Response) => {
    try {
        const account = await DB.getAccountById(parseInt(req.params.id));
        return res.status(200).json(account);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/accounts', async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const account = await DB.createAccount(req.body);
        return res.status(200).json(account);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/accounts/:id', async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const account = await DB.getAccountById(parseInt(req.params.id));

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        account.limit = req.body.limit;
        account.products = req.body.products;
        account.account_id = req.body.account_id;
        await DB.updateAccount(account);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/accounts/:id', async (req: Request, res: Response) => {
    try {
        await DB.deleteAccount(req.params.id);
        return res.status(200).json({ message: 'Account deleted' });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/customers', async (req: Request, res: Response) => {
    try {
        let customers;
        if (req.query.name) {
            customers = await DB.getCustomersByName(req.query.name as string);
        } else {
            customers = await DB.getAllCustomers();
        }

        return res.status(200).json(customers);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/customers/:email', async (req: Request, res: Response) => {
    try {
        const customer = await DB.getCustomerByEmail(req.params.email);
        return res.status(200).json(customer);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/customers', async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const customer = await DB.createCustomer(req.body);
        return res.status(200).json(customer);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/customers/:id', async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const customer = await DB.getCustomerById(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const updatedCustomer = await DB.updateCustomer(
            req.params.id,
            req.body
        );
        return res.status(200).json(updatedCustomer);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/customers/:id', async (req: Request, res: Response) => {
    try {
        const customer = await DB.getCustomerById(req.params.id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        await DB.deleteCustomer(req.params.id);
        return res.status(200).json({ message: 'Customer deleted' });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/transactions', async (req: Request, res: Response) => {
    try {
        const transactions = await DB.getAllTransactions();
        return res.status(200).json(transactions);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
        const transaction = await DB.getTransactionById(req.params.id);
        return res.status(200).json(transaction);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/customers/:id/accounts', async (req: Request, res: Response) => {
    try {
        const accounts = await DB.getCustomerAccounts(req.params.id);
        return res.status(200).json(accounts);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/all-products', async (req: Request, res: Response) => {
    try {
        const products = await DB.getAllProducts();
        return res.status(200).json(products);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/customers/:id/transactions', async (req: Request, res: Response) => {
    try {
        const { customer, transactions } = await DB.getCustomerTransactions(
            req.params.id
        );
        return res.status(200).json({ customer, transactions });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.get(
    '/customers-with-most-transactions',
    async (req: Request, res: Response) => {
        try {
            const customers = await DB.getCustomersWithMostTransactions();
            console.log(customers);
            return res.status(200).json(customers);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
);

app.get('/all-transaction-amounts', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const transactionAmountAndTotal = await DB.getAllTransactionAmounts(
            startDate ? new Date(startDate as string) : null,
            endDate ? new Date(endDate as string) : null
        );
        return res.status(200).json(transactionAmountAndTotal);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

app.use((req, res) => {
    console.log('Invalid path requested');
    res.status(404).json({ error: 'Invalid path requested' });
});

try {
    DB.initialize(MONGODB_URI);

    app.listen(HTTP_PORT, () => {
        console.log(`Listening on port ${HTTP_PORT}`);
    });
} catch (err) {
    console.log(err);
}
