const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
//valor da metade entre o min e o max: 0x5ffffffffffffffff usado como min e max
    /*
        dividindo as tarefas:
        usando apenas uma maquina, dividindo entre threads
        ex: const minKey = BigInt('0x40000000000000000');
            const maxKey = BigInt('0x5ffffffffffffffff');
        na outra thread buscamos entre:  
        ex: const minKey = BigInt('0x60000000000000000');
            const maxKey = BigInt('0x7ffffffffffffffff');
    */


if (isMainThread) {
    // Endereço alvo
    // const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';

    // // Intervalo de chave privada
    // const minKey = BigInt('0x40000000000000000');
    // const maxKey = BigInt('0x7ffffffffffffffff');

    //teste puzzle
    const targetAddress = '15JhYXn6Mx3oF4Y7PcTAv2wVVAuCFFQNiP';
    const minKey = BigInt('0x1000000');
    const maxKey = BigInt('0x1ffffff');
    
    // Dividir o intervalo em duas partes
    const midKey = (minKey + maxKey) / BigInt(2);

    const minKey1 = minKey;
    const maxKey1 = midKey;

    const minKey2 = midKey + BigInt(1);
    const maxKey2 = maxKey;

    // Iniciar duas threads
    const ranges = [
        { start: minKey1, end: maxKey1 },
        { start: minKey2, end: maxKey2 }
    ];

    const workers = [];

    for (let i = 0; i < 2; i++) {
        const worker = new Worker(__filename);
        workers.push(worker);
        worker.postMessage({ targetAddress, minKey: ranges[i].start, maxKey: ranges[i].end });
        worker.on('message', (message) => {
            if (message.found) {
                console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
                workers.forEach(w => w.terminate()); // Terminar todos os workers
                process.exit(0); // Terminar o processo principal
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