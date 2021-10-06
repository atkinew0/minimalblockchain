const sha256 = require('crypto-js/sha256');



class Transaction {
    amount: number;
    from: string;
    to: string;

    constructor(amount:number, from:string, to: string) {
        this.amount = amount;
        this.from = from;
        this.to = to;
    }

    getHash(): string {
        
        return sha256(this.amount + this.from + this.to).toString();
    }

}

class Block {


    
    timeStamp:number;
    transactions: Transaction[];
    previousHash: string;
    hash:string;

    constructor(timeStamp: number, transactions: Transaction[], previousHash:string =""){
        
        this.timeStamp = timeStamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.getHash();
    }

    getHash(): string{

        const transHash: string = this.transactions.reduce((accum, elem) => {
            return sha256(accum + elem.amount + elem.to + elem.from).toString();
        },"")

        return sha256( this.timeStamp.toString() + this.previousHash + transHash).toString()
    }


}

class Blockchain {

    blocks:Block[];

    constructor(){
        const genesisBlock = new Block(Date.now(), [] as Transaction[], "")

        this.blocks = [genesisBlock]
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length -1];
    }

    getBlock(index: number): Block {
        
        return index < this.blocks.length ? this.blocks[index] : new Block(0, Date.now(), [] as Transaction[], "");
    }

    addBlock(block: Block){

        block.previousHash = this.getLastBlock().hash;
        block.hash = block.getHash();
        this.blocks.push(block);

    }

    checkBlockchain(): boolean {

        return this.blocks.every( (block, index, array) => {

            if(index == 0){
                //the genesis block is never invalid
                return true;
            }else {
                return (
                    //check that no hashes have been altered
                    block.hash == block.getHash() &&
                    block.previousHash == array[index -1].hash
                )
            }



        })
    }

    
}


//demo code

let main = new Blockchain();

let user1 = sha256("amy").toString();
let user2 = sha256("bob").toString();

let t1 = new Transaction(10, user1, user2);
let t2 = new Transaction(20, user2, user1);

main.addBlock(new Block(main.blocks.length, Date.now(), [t1, t2], ""));
main.addBlock(new Block(main.blocks.length, Date.now(), [t2, t1], ""));
main.addBlock(new Block(main.blocks.length, Date.now(), [t1, t2], ""));

console.log(main);



for(let i = 0; i < main.blocks.length; i++){
    console.log(`Previous hash of block ${i} is ${main.blocks[i].previousHash} Hash of block ${i} is ${main.blocks[i].hash}`)
}

console.log("Main is valid? " , main.checkBlockchain())



//now modify the blockchain illegally by rewriting the amount in an accepted transaction
main.blocks[1].transactions[0].amount = 50;

console.log("Main is valid? " , main.checkBlockchain())

console.log("Block 1 hashes to - ", main.blocks[1].getHash(), "block 1 stored hash", main.blocks[1].hash)





