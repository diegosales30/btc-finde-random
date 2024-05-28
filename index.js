/************************INCIO***********************************/
/*CODIGO TESTE*/
/*
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const targetAddress = '12jbtzBb54r97TCwW3G1gCFoumpckRAPdY';

const privateKeys = [
  '0000000000000000000000000000000000000000000000000000000000556e52',
  '0000000000000000000000000000000000000000000000000000000000dc2a04',
  '0000000000000000000000000000000000000000000000000000000001fa5ee5',
  '000000000000000000000000000000000000000000000000000000000340326e',
  '0000000000000000000000000000000000000000000000000000000006ac3875',
  '000000000000000000000000000000000000000000000000000000000d916ce8',
  '0000000000000000000000000000000000000000000000000000000017e2551e',
  '000000000000000000000000000000000000000000000000000000003d94cd64',
  '000000000000000000000000000000000000000000000000000000007d4fe747'
    // Adicione mais chaves privadas aqui, se necessário
];


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

for (const privateKeyHex of privateKeys) {
    if (checkAddress(privateKeyHex)) {
        console.log(`Chave privada encontrada: ${privateKeyHex}`);
        break;
    } else {
        console.log(`Tentativa com chave: ${privateKeyHex} falhou.`);
    }
}
*/
/************************FIM************************************/


/************************INCIO***********************************/
/*gerador funcional. gera chaves sequencial padrão*/
/*
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');

const targetAddress = '1NpnQyZ7x24ud82b7WiRNvPm6N8bqGQnaS';

const minKey = BigInt('0x4000000000000');
const maxKey = BigInt('0x7ffffffffffff');

function getRandomPrivateKey(min, max) {
    const range = max - min;
    const randomOffset = BigInt('0x' + crypto.randomBytes(16).toString('hex')) % range;
    return min + randomOffset;
}

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

function findPrivateKey(targetAddress, minKey, maxKey) {
    let attempts = 0;

    while (true) {
        const privateKey = getRandomPrivateKey(minKey, maxKey);
        const privateKeyHex = privateKey.toString(16).padStart(64, '0');
        attempts++;

        //esse console exibe as tentativas para ver o processo.
        console.log(`Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);

        if (checkAddress(privateKeyHex)) {
            console.log(`Chave privada encontrada: ${privateKeyHex}`);
            console.log(`Tentativas: ${attempts}`);
            return privateKeyHex;
        }

        if (attempts % 100000 === 0) {
            console.log(`Tentativas: ${attempts}`);
        }
    }
}
findPrivateKey(targetAddress, minKey, maxKey);
*/
/************************FIM************************************/


/************************INICIO***********************************/
/*gerador aleatorio funcional. gera chaves de maneira aleatoria, e nao sequencial*/
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');

// Endereço alvo
const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';

// Intervalo de chave privada
const minKey = BigInt('0x40000000000000000');
const maxKey = BigInt('0x7ffffffffffffffff');

// Função para gerar uma chave privada aleatória dentro do intervalo
function getRandomPrivateKey(min, max) {
    const range = max - min;
    const randomOffset = BigInt('0x' + crypto.randomBytes(16).toString('hex')) % range;
    return min + randomOffset;
}

// Função para verificar se o endereço gerado corresponde ao endereço alvo
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

// Função principal para tentar encontrar a chave privada correspondente
function findPrivateKey(targetAddress, minKey, maxKey) {
    let attempts = 0;

    while (true) {
        const privateKey = getRandomPrivateKey(minKey, maxKey);
        const privateKeyHex = privateKey.toString(16).padStart(64, '0');
        attempts++;

        // Adiciona log para cada chave gerada
        console.log(`Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);

        if (checkAddress(privateKeyHex)) {
            console.log(`Chave privada encontrada: ${privateKeyHex}`);
            console.log(`Tentativas: ${attempts}`);
            return privateKeyHex;
        }

        if (attempts % 100000 === 0) {
            console.log(`Tentativas: ${attempts}`);
        }
    }
}

// Executar a busca
findPrivateKey(targetAddress, minKey, maxKey);
/************************FIM*************************************/
