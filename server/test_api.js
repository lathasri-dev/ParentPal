const http = require('http');

http.get('http://127.0.0.1:5000/api/profiles', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Body:', data);
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
