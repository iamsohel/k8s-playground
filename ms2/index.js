const express = require('express');
const app = express();


app.get('/api/ms2/getAll', (req, res) => {
    res.send({ data: 'hello from micro-service 2 get all' })
})

app.get('/api/ms2', (req, res) => {
    res.send({ data: 'hello from micro-service 2' })
})

app.listen(4000, () => {
    console.log('server is running');
})