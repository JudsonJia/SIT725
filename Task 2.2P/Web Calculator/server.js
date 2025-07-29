const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint to add two numbers
app.get('/add/:num1/:num2', (req, res) => {
    const num1 = parseFloat(req.params.num1);
    const num2 = parseFloat(req.params.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided',
            message: 'Please provide valid numeric values'
        });
    }

    const result = num1 + num2;
    res.json({
        operation: 'addition',
        num1: num1,
        num2: num2,
        result: result,
        calculation: `${num1} + ${num2} = ${result}`
    });
});

// GET endpoint with query parameters for addition
app.get('/add', (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided',
            message: 'Please provide num1 and num2 as query parameters'
        });
    }

    const result = num1 + num2;
    res.json({
        operation: 'addition',
        num1: num1,
        num2: num2,
        result: result,
        calculation: `${num1} + ${num2} = ${result}`
    });
});

// Additional calculator operations
app.get('/subtract/:num1/:num2', (req, res) => {
    const num1 = parseFloat(req.params.num1);
    const num2 = parseFloat(req.params.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided'
        });
    }

    const result = num1 - num2;
    res.json({
        operation: 'subtraction',
        num1: num1,
        num2: num2,
        result: result,
        calculation: `${num1} - ${num2} = ${result}`
    });
});

app.get('/multiply/:num1/:num2', (req, res) => {
    const num1 = parseFloat(req.params.num1);
    const num2 = parseFloat(req.params.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided'
        });
    }

    const result = num1 * num2;
    res.json({
        operation: 'multiplication',
        num1: num1,
        num2: num2,
        result: result,
        calculation: `${num1} × ${num2} = ${result}`
    });
});

app.get('/divide/:num1/:num2', (req, res) => {
    const num1 = parseFloat(req.params.num1);
    const num2 = parseFloat(req.params.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided'
        });
    }

    if (num2 === 0) {
        return res.status(400).json({
            error: 'Division by zero is not allowed'
        });
    }

    const result = num1 / num2;
    res.json({
        operation: 'division',
        num1: num1,
        num2: num2,
        result: result,
        calculation: `${num1} ÷ ${num2} = ${result}`
    });
});

// POST endpoint for calculator operations
app.post('/calculate', (req, res) => {
    const { num1, num2, operation } = req.body;

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
        return res.status(400).json({
            error: 'Invalid numbers provided'
        });
    }

    let result;
    let symbol;

    switch (operation) {
        case 'add':
            result = n1 + n2;
            symbol = '+';
            break;
        case 'subtract':
            result = n1 - n2;
            symbol = '-';
            break;
        case 'multiply':
            result = n1 * n2;
            symbol = '×';
            break;
        case 'divide':
            if (n2 === 0) {
                return res.status(400).json({
                    error: 'Division by zero is not allowed'
                });
            }
            result = n1 / n2;
            symbol = '÷';
            break;
        default:
            return res.status(400).json({
                error: 'Invalid operation. Use: add, subtract, multiply, or divide'
            });
    }

    res.json({
        operation: operation,
        num1: n1,
        num2: n2,
        result: result,
        calculation: `${n1} ${symbol} ${n2} = ${result}`
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Express Calculator API',
        endpoints: {
            'GET /add/:num1/:num2': 'Add two numbers using URL parameters',
            'GET /add?num1=x&num2=y': 'Add two numbers using query parameters',
            'GET /subtract/:num1/:num2': 'Subtract two numbers',
            'GET /multiply/:num1/:num2': 'Multiply two numbers',
            'GET /divide/:num1/:num2': 'Divide two numbers',
            'POST /calculate': 'Perform calculation with JSON body: {num1, num2, operation}'
        },
        examples: {
            addition: '/add/5/3 or /add?num1=5&num2=3',
            subtraction: '/subtract/10/4',
            multiplication: '/multiply/6/7',
            division: '/divide/15/3'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Visit /api for available endpoints'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api`);
});

module.exports = app;