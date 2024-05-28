const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
//valor da metade entre o min e o max: 0x5ffffffffffffffff usado como min e max
    /*
        dividindo as tarefas:
        na primeira maquina usamos:
        ex: const minKey = BigInt('0x40000000000000000');
            const maxKey = BigInt('0x5ffffffffffffffff');
        na outra maquina buscamos entre:  
        ex: const minKey = BigInt('0x60000000000000000');
            const maxKey = BigInt('0x7ffffffffffffffff');
    */

if (isMainThread) {
    // const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';
    // const minKey = BigInt('0x60000000000000000');
    // const maxKey = BigInt('0x7ffffffffffffffff');

    //teste puzzle
    const targetAddress = '15JhYXn6Mx3oF4Y7PcTAv2wVVAuCFFQNiP';
    const minKey = BigInt('0x1800000');
    const maxKey = BigInt('0x1ffffff');

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

    const ranges = divideRange(minKey, maxKey, 3);

    for (let i = 0; i < 3; i++) {
        const worker = new Worker(__filename);
        worker.postMessage({ targetAddress, minKey: ranges[i].start, maxKey: ranges[i].end });
        worker.on('message', (message) => {
            if (message.found) {
                console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
                process.exit(0);
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
                const publicKey = key.getPublic(true, 'hex');
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
            console.log(`Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);
            if (attempts % 1000 === 0) {
                parentPort.postMessage({ threadId, attempts });
            }

            if (checkAddress(privateKeyHex)) {
                parentPort.postMessage({ found: true, privateKeyHex });
                return;
            }
            privateKey++;
        }
    });
}