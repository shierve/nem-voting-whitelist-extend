import { BroadcastedPoll } from "nem-voting";
import { NEMLibrary, NetworkTypes, Account, TransactionHttp, Address, TimeWindow, NodeHttp, TransferTransaction } from 'nem-library';
import { Observable } from "rxjs";

NEMLibrary.bootstrap(NetworkTypes.TEST_NET); // Change to NetworkTypes.MAIN_NET for main net
const testPrivateKey = ""; // introduce the poll creator private key
const pollAddress = "TC4SKO5ROW22VQGQZ2ORLKUJJ3RCKMLYWJ4WKC2N"; // the address of the poll that we want to extend
const newAddresses = ["TCCXQPJNPXAZFKV2IZHIFLAGTSN42WPNAQI6XGK3"]; // the new addresses to be added to the whitelist

const addresses = newAddresses.filter((a) => {
    try {
        new Address(a);
        return true;
    } catch (_) {
        console.log(a + " is not a valid address");
        return false;
    }
}).map((a) => new Address(a));
const account = Account.createWithPrivateKey(testPrivateKey);


const nodeHttp = new NodeHttp();
nodeHttp.getNisNodeInfo().subscribe((nodeInfo) => {
    // for fixing the timestamp error at testnet
    const chainTime = nodeInfo.nisInfo.currentTime;
    console.log("chain time:", chainTime);
    const d = new Date();
    const timeStamp = Math.floor(chainTime) + Math.floor(d.getSeconds() / 10);
    const due = (NEMLibrary.getNetworkType() === NetworkTypes.TEST_NET) ? 60 : 24 * 60;
    const deadline = timeStamp + due * 60;
    BroadcastedPoll.fromAddress(new Address(pollAddress))
        .subscribe((poll) => {
            // get the extend transactions
            const transactions = poll.extendWhitelist(addresses).map(t => {
                (t as any).timeWindow = (TimeWindow as any).createFromDTOInfo(timeStamp, deadline);
                return (t as TransferTransaction);
            });
            // Now we sign and broadcast the transactions
            const transactionHttp = new TransactionHttp();
            Observable.merge(...(transactions.map((t) => {
                const signed = account.signTransaction(t);
                return transactionHttp.announceTransaction(signed);
            }))).first().subscribe(() => {
                console.log("whitelist extended");
            });
        });
});
