const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + secret);
console.log('');
console.log('Copy this line to your .env file replacing the existing JWT_SECRET value.');
