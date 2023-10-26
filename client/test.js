const axios = require('axios');

async function test(numberOfCall) {
    for (let i = 0; i < numberOfCall; i++) {
        const response = await axios.get('http://ms1-helm.dev/api/ms1/');
        console.log(i, response.data)
    }
}

test(100000)
