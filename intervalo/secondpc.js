/*
    dividindo as tarefas:
    na primeira maquina usamos:
    ex: const minKey = BigInt('0x40000000000000000');
        const maxKey = BigInt('0x5ffffffffffffffff');
    na outra maquina buscamos entre:  
    ex: const minKey = BigInt('0x60000000000000000');
        const maxKey = BigInt('0x7ffffffffffffffff');
*/

/*
essa versão atingiu o limite de 12828000 tentativas
até encher a memoria.
erro:  Tentativas: 12828000, 
Chave: 000000000000000000000000000000000000000000000006434a5648c21b17cc     
Erro no worker: Worker terminated due to reaching memory limit: JS heap out of memory
Worker finalizado com o código 1
*/
/*
const {
  Worker,
  isMainThread,
  parentPort,
  threadId,
  workerData,
} = require("worker_threads");
const bitcoin = require("bitcoinjs-lib");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const crypto = require("crypto");

if (isMainThread) {
  const targetAddress = "1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9";
  //const minKey = BigInt('0x60000000000000000');
  const minKey = BigInt("0x6434a5648c21b17cc"); //random gerado
  const maxKey = BigInt("0x7ffffffffffffffff");

  function divideRange(min, max, parts) {
    const range = max - min;
    const partSize = range / BigInt(parts);
    const ranges = [];
    for (let i = 0; i < parts; i++) {
      const start = min + partSize * BigInt(i);
      const end = i === parts - 1 ? max : start + partSize - BigInt(1);
      ranges.push({ start, end });
    }
    return ranges;
  }

  const numWorkers = 3; // Ajuste conforme necessário
  const ranges = divideRange(minKey, maxKey, numWorkers);

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: {
        targetAddress,
        minKey: ranges[i].start,
        maxKey: ranges[i].end,
      },
    });

    worker.on("message", (message) => {
      if (message.found) {
        console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
        process.exit(0);
      } else {
        console.log(
          `Thread ${message.threadId} - Tentativas: ${message.attempts}, Chave: ${message.privateKeyHex}`
        );
      }
    });

    worker.on("error", (error) => {
      console.error(`Erro no worker: ${error.message}`);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker finalizado com o código ${code}`);
      }
    });
  }
} else {
  const { targetAddress, minKey, maxKey } = workerData;

  function checkAddress(privateKeyHex) {
    try {
      const key = ec.keyFromPrivate(privateKeyHex);
      const publicKey = key.getPublic(true, "hex");
      const { address } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(publicKey, "hex"),
      });
      return address === targetAddress;
    } catch (error) {
      console.error(`Erro ao verificar chave privada: ${error.message}`);
      return false;
    }
  }

  let attempts = 0;
  let privateKey = minKey;

  while (privateKey <= maxKey) {
    const privateKeyHex = privateKey.toString(16).padStart(64, "0");
    attempts++;

    console.log(
      `Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`
    );

    if (attempts % 1000 === 0) {
      parentPort.postMessage({ threadId, attempts, privateKeyHex });
    }

    if (checkAddress(privateKeyHex)) {
      parentPort.postMessage({ found: true, privateKeyHex });
      return;
    }
    privateKey++;
  }

  // Informe que o worker terminou sua tarefa
  parentPort.postMessage({
    threadId,
    attempts: `Finalizado com ${attempts} tentativas`,
    privateKeyHex: privateKey.toString(16).padStart(64, "0"),
  });
}
//node --max-old-space-size=4096 secondpc.js
*/
//possivel correção: do limite de memoria acima:
/*

com essa abordagem de processar as chaves em lotes
e limitar o tamanho de cada lote, 
é possível manter o código funcionando
de forma estável e sem consumir toda a memória disponível, 
mesmo que o código esteja sendo executado
infinitamente até encontrar a chave.
*/


const { Worker, isMainThread, parentPort, threadId, workerData } = require('worker_threads');
const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');

if (isMainThread) {
    const targetAddress = '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9';
    const minKey = BigInt('0x6434a5648c2de8edb'); //random gerado / continuação pos erro limite 12810000
    const maxKey = BigInt('0x7ffffffffffffffff');
    const numWorkers = 3;
    
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

    const ranges = divideRange(minKey, maxKey, numWorkers);

    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(__filename, {
            workerData: {
                targetAddress,
                minKey: ranges[i].start,
                maxKey: ranges[i].end,
            }
        });

        worker.on('message', (message) => {
            if (message.found) {
                console.log(`Chave privada encontrada: ${message.privateKeyHex}`);
                process.exit(0);
            } else {
                console.log(`Thread ${message.threadId} - Tentativas: ${message.attempts}, Chave: ${message.privateKeyHex}`);
            }
        });

        worker.on('error', (error) => {
            console.error(`Erro no worker: ${error.message}`);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker finalizado com o código ${code}`);
            }
        });
    }
} else {
    const { targetAddress, minKey, maxKey } = workerData;

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
    const batchSize = 1000; // Defina o tamanho do lote conforme necessário
    let privateKey = minKey;

    while (privateKey <= maxKey) {
        for (let i = 0; i < batchSize && privateKey <= maxKey; i++) {
            const privateKeyHex = privateKey.toString(16).padStart(64, '0');
            attempts++;

            if (attempts % 1000 === 0) {
                console.log(`Tentativa #${attempts}: Chave privada gerada: ${privateKeyHex}`);
                parentPort.postMessage({ threadId, attempts, privateKeyHex });
            }

            if (checkAddress(privateKeyHex)) {
                parentPort.postMessage({ found: true, privateKeyHex });
                return;
            }

            privateKey++;
        }
    }

    // Informe que o worker terminou sua tarefa
     parentPort.postMessage({ threadId, attempts: `Finalizado com ${attempts} tentativas`, privateKeyHex: privateKey.toString(16).padStart(64, '0') });
}
//node --max-old-space-size=4096 secondpc.js

