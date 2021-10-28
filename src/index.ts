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


    //this data would be the "Block Header" in a standard blockchain
    timeStamp:number;
    previousHash: string;
    hash:string;
    nonce: number;
    difficulty: number = 4;
    

    //This data is often referred to as the "block body" in Ethereum etc
    transactions: Transaction[];

    constructor(timeStamp: number, transactions: Transaction[]){
        
        this.timeStamp = timeStamp;
        this.transactions = transactions;
        this.previousHash = ""
        this.nonce = 0;
        this.hash = ""
        
    }

    getHash(): string{

        const transHash: string = this.transactions.reduce((accum, elem) => {
            return sha256(accum + elem.amount + elem.to + elem.from).toString();
        },"")

        return sha256( this.timeStamp.toString() + this.previousHash + transHash + this.nonce).toString()
    }

    mineBlock() {

        let hash = this.getHash();

        while(hash.slice(0,this.difficulty) !== "0".repeat(this.difficulty) ){
            this.nonce++;
            hash = this.getHash();
        }
        this.hash = hash;

        console.log("New block mined! ", hash);


    }


}

class Blockchain {

    blocks:Block[];
    pendingTransactions: Transaction[];
    miningReward: number = 10;

    //using an Eth style account balance system
    worldState: { [address : string]: number}

    constructor(){
        const genesisBlock = new Block(Date.now(), [] as Transaction[])
        genesisBlock.hash = genesisBlock.getHash();
        this.pendingTransactions = []
        this.blocks = [genesisBlock]
        this.worldState = {}
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length -1];
    }

    getBlock(index: number): Block {
        
        return index < this.blocks.length ? this.blocks[index] : new Block(Date.now(), [] as Transaction[]);
    }

    addBlock(block: Block){

        block.previousHash = this.getLastBlock().hash;
        block.mineBlock();

        //this is where previously validated transactions actually get executed, ie world state gets updated 
        block.transactions.forEach(trans => {
            this.transfer(trans);
        })

        this.blocks.push(block);

    }

    transfer({ to, from, amount}: Transaction){

        if(from === ""){
            //a coinbase transaction creating coins from nothing
            console.log(`Created ${this.miningReward} new coins `)
            this.worldState[to] = this.worldState[to] === undefined ? amount : this.worldState[to] + amount;

        }else{
            //a regular transfer from user account to user account

            if(this.worldState[from] === undefined || this.worldState[from] < amount){
                return;
            }else{
                this.worldState[from] -= amount;
                this.worldState[to] = this.worldState[to] === undefined ? amount : this.worldState[to] + amount;
            }



        }
    }

    validateTransaction({ to, from, amount}: Transaction): boolean {
        //TODO - technically transaction should be validated as a group to prevent double spends etc

        if(from === "" && amount === this.miningReward){
            return true;
        }

        if(this.worldState[to] !== undefined && this.worldState[to] > amount){
            return true;
        }else{
            return false;
        }

        
    }

    minePendingTransactions(rewardAddress: string){

        let newBlock = new Block(Date.now(), [] )

        this.pendingTransactions.forEach( trans => {
            if(this.validateTransaction(trans)){
                newBlock.transactions.push(trans);
            }
        })

        newBlock.transactions.push(new Transaction(this.miningReward, "", rewardAddress));

        this.addBlock(newBlock);
        this.pendingTransactions = []
        

    }

    sendTransaction(trans: Transaction){
        //this is our pretend equivalent of using a node to broadcast a transaction to the p2p network, instead we push to our "mempool" array
        this.pendingTransactions.push(trans);

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

let bytecoin = new Blockchain();

//make some users and give them balances by fiat to start test
let user1 = sha256("alice").toString();
let user2 = sha256("bob").toString();
bytecoin.worldState[user1] = 100;
bytecoin.worldState[user2] = 200;

let user3 = sha256("satoshi").toString();

let t1 = new Transaction(10, user1, user2);
let t2 = new Transaction(20, user2, user1);

bytecoin.sendTransaction(t1);
bytecoin.sendTransaction(t2);

bytecoin.minePendingTransactions(user3);

bytecoin.minePendingTransactions(user3);

console.log(bytecoin)



console.log("Blockchain is valid? ", bytecoin.checkBlockchain())



// //now modify the blockchain illegally by rewriting the amount in an accepted transaction
// main.blocks[1].transactions[0].amount = 50;

// console.log("Main is valid? " , main.checkBlockchain())

// console.log("Block 1 hashes to - ", main.blocks[1].getHash(), "block 1 stored hash", main.blocks[1].hash)





