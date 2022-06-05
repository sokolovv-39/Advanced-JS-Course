const express = require('express');
const fs = require('fs');
const path = require('path');
const productsDBPath = path.join(__dirname, 'db/products.json');
const cartDBPath = path.join(__dirname, 'db/userCart.json');
const statsDBPath = path.join(__dirname, 'db/stats.json');

const app = express();

app.use(express.json());
app.use('', express.static('../public'));

app.get('/api/products', (req, res) => {
    fs.readFile(productsDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else res.send(data);
    });
});

app.get('/api/cart', (req, res) => {
    fs.readFile(cartDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else res.send(data);
    });
});

app.post('/api/cart', (req, res) => {
    fs.readFile(cartDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else {
            const cartData = JSON.parse(data);
            cartData.contents.push(req.body);

            fs.writeFile(cartDBPath, JSON.stringify(cartData), 'utf-8', (err) => {
                if (err) res.send(err);
                else res.send(JSON.stringify({ result: 1 }));
            });
        }
    });
});

app.put('/api/cart/:id', (req, res) => {
    fs.readFile(cartDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else {
            const cartData = JSON.parse(data);
            const find = cartData.contents.find((good) => {
                return good.id_product === +req.params.id
            });
            find.quantity += req.body.quantity;

            fs.writeFile(cartDBPath, JSON.stringify(cartData), 'utf-8', (err) => {
                if (err) res.send(err);
                else addStats(res, find, 'buy');
            });
        }
    });
});

app.delete('/api/cart/:id', (req, res) => {
    fs.readFile(cartDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else {
            const cartData = JSON.parse(data);
            const find = cartData.contents.find((good) => {
                return good.id_product === +req.params.id
            });
            if (find.quantity > 1) {
                find.quantity--;
            }
            else {
                cartData.contents.splice(cartData.contents.indexOf(find), 1);
            }

            fs.writeFile(cartDBPath, JSON.stringify(cartData), 'utf-8', (err) => {
                if (err) res.send(err);
                else addStats(res, find, 'deleteFromCart');
            });
        }
    });
});

function addStats(res, product, action) {
    fs.readFile(statsDBPath, 'utf-8', (err, data) => {
        if (err) res.send(err);
        else {
            let statsArr = JSON.parse(data);
            const stats = {
                product: product.product_name,
                action: action,
                date: new Date()
            };
            statsArr.push(stats);
            fs.writeFile(statsDBPath, JSON.stringify(statsArr), 'utf-8', (err) => {
                if (err) res.send(err);
                else res.send(JSON.stringify({ result: 1 }));
            })
        }
    })
}

app.listen(5555, () => {
    console.log('Server started!');
});