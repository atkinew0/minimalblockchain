const EC = require('elliptic').ec;

const ec = new EC('secp256k1');


const keyPair = ec.genKeyPair();
const pubKey = keyPair.getPublic("hex");
const privateKey = keyPair.getPrivate("hex");

console.log("pub key ", pubKey);
console.log("private ", privateKey)

