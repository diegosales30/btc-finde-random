// const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
// const bitcoin = require('bitcoinjs-lib');
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');
// const crypto = require('crypto');

// if (isMainThread) {
//     // Endereço alvo
//     const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';
  
//     // Intervalo de chave privada
//     const minKey = BigInt('0x40000000000000000');
//     const maxKey = BigInt('0x7ffffffffffffffff');

//     //teste puzzle 20
//     //1HsMJxNiV7TLxmoF6uJNkydxPFDog4NQum
//     // const minKey = BigInt('0x80000');
//     // const maxKey = BigInt('0xfffff');
    

//     // Função para dividir o intervalo entre as threads
//     function divideRange(min, max, parts) {
//         const range = max - min;
//         const partSize = range / BigInt(parts);
//         const ranges = [];
//         for (let i = 0; i < parts; i++) {
//             const start = min + partSize * BigInt(i);
//             const end = (i === parts - 1) ? max : start + partSize - BigInt(1);
//             ranges.push({ start, end });
//         }
//         return ranges;
//     }

//     // Dividir o intervalo de chaves privadas entre 3 threads
//     const ranges = divideRange(minKey, maxKey, 3);

//     for (let i = 0; i < 3; i++) {
//         const worker = new Worker(__filename);
//         worker.postMessage({ targetAddress, minKey: ranges[i].start, maxKey: ranges[i].end });
//         worker.on('message', (message) => {
//             if (message.found) {
//                 console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
//                 process.exit(0); // Terminar todos os workers
//             } 
//             else {
//                 console.log(`Thread ${message.threadId} - Tentativas: ${message.attempts}`);
//             }
//         });
//     }
// } else {
//     parentPort.on('message', ({ targetAddress, minKey, maxKey }) => {
//         function getRandomPrivateKey(min, max) {
//             const range = max - min;
//             const randomOffset = BigInt('0x' + crypto.randomBytes(16).toString('hex')) % range;
//             return min + randomOffset;
//         }

//         function checkAddress(privateKeyHex) {
//             try {
//                 const key = ec.keyFromPrivate(privateKeyHex);
//                 const publicKey = key.getPublic(true, 'hex'); // compressed public key
//                 const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') });
//                 return address === targetAddress;
//             } catch (error) {
//                 console.error(`Erro ao verificar chave privada: ${error.message}`);
//                 return false;
//             }
//         }

//         let attempts = 0;

//         while (true) {
//             const privateKey = getRandomPrivateKey(minKey, maxKey);
//             const privateKeyHex = privateKey.toString(16).padStart(64, '0');
//             attempts++;
//             //quero add esse console para monitorar as chaves sendo geradas
//             // console.log(`Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);
//             if (attempts % 1000 === 0) {
//                 parentPort.postMessage({ threadId, attempts });
//             }

//             if (checkAddress(privateKeyHex)) {
//                 parentPort.postMessage({ found: true, privateKeyHex });
//                 return;
//             }
//         }
//     });
// }

const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

if (isMainThread) {
    // Endereço alvo
    //const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';

    //teste puzzle 20
    //1HsMJxNiV7TLxmoF6uJNkydxPFDog4NQum
    const targetAddress = '1LHtnpd8nU5VHEMkG2TMYYNUjjLc992bps';
    const minKey = BigInt('0x2fffffff');
    const maxKey = BigInt('0x3fffffff');
    //20000000...3fffffff
    //1LHtnpd8nU5VHEMkG2TMYYNUjjLc992bps
    // Intervalo de chave privada
    // const minKey = BigInt('0x40000000000000000');
    // const maxKey = BigInt('0x7ffffffffffffffff');
    
    // Função para dividir o intervalo entre as threads
    function divideRange(min, max, parts) {
        const range = max - min;
        const partSize = range / BigInt(parts);
        const ranges = [];
        for (let i = 0; i < parts; i++) {
            const start = min + partSize * BigInt(i);
            const end = (i === parts - 1) ? max : start + partSize - BigInt(1);
            ranges.push({ start, end });
        }
        return ranges;
    }

    // Dividir o intervalo de chaves privadas entre 3 threads
    const ranges = divideRange(minKey, maxKey, 3);

    for (let i = 0; i < 3; i++) {
        const worker = new Worker(__filename);
        worker.postMessage({ targetAddress, minKey: ranges[i].start, maxKey: ranges[i].end });
        worker.on('message', (message) => {
            if (message.found) {
                console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
                process.exit(0); // Terminar todos os workers
            } else {
                console.log(`Thread ${message.threadId} - Tentativas: ${message.attempts}`);
            }
        });
    }
} else {
    parentPort.on('message', ({ targetAddress, minKey, maxKey }) => {
        function checkAddress(privateKeyHex) {
            try {
                const key = ec.keyFromPrivate(privateKeyHex);
                const publicKey = key.getPublic(true, 'hex'); // compressed public key
                const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') });
                return address === targetAddress;
            } catch (error) {
                console.error(`Erro ao verificar chave privada: ${error.message}`);
                return false;
            }
        }

        let attempts = 0;
        let privateKey = minKey;

        while (privateKey <= maxKey) {
            const privateKeyHex = privateKey.toString(16).padStart(64, '0');
            attempts++;
            privateKey++;

            // Log para monitorar as chaves sendo geradas
            console.log(`Thread ${threadId} - Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);

            if (attempts % 1000 === 0) {
                parentPort.postMessage({ threadId, attempts });
            }

            if (checkAddress(privateKeyHex)) {
                parentPort.postMessage({ found: true, privateKeyHex });
                return;
            }
        }
    });
}