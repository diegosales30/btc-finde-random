const crypto = require('crypto');

/*
  MIDKEY É A METADE ENTRE: 
  const minKey = BigInt('0x60000000000000000');
    const maxKey = BigInt('0x7ffffffffffffffff'); POSSO USAR COMO MINKEY
  const midKey = BigInt('0x70000000000000000');
*/
//pegar um valor aleatório entre o inicio e o fim
const midKey = BigInt('0x4ffffffffffffffff');

function getRandomBigIntAroundMidKey(midKey) {
    // Generate a small random offset
    const offsetBytes = 8; // Use 8 bytes for a relatively small range around midKey
    const randomBuffer = crypto.randomBytes(offsetBytes);
    const randomOffset = BigInt('0x' + randomBuffer.toString('hex'));

    // Flip a coin to decide whether to add or subtract the offset
    const addOffset = crypto.randomBytes(1)[0] % 2 === 0;

    return addOffset ? midKey + randomOffset : midKey - randomOffset;
}

const randomKey = getRandomBigIntAroundMidKey(midKey);
console.log(randomKey.toString(16));