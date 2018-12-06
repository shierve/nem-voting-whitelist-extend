import { BroadcastedPoll } from "nem-voting";
import { NEMLibrary, NetworkTypes, Account, TransactionHttp, Address, TimeWindow, NodeHttp, TransferTransaction } from 'nem-library';
var fs = require('fs');

NEMLibrary.bootstrap(NetworkTypes.TEST_NET); // Change to NetworkTypes.MAIN_NET for main net


const pollAddress = new Address("your-poll-address"); // the address of the poll that we want to extend

 
BroadcastedPoll.fromAddress(pollAddress)
.map((poll) => {
    return poll;
})
.subscribe((results) => {
    console.log("Valid poll");
    console.log(results.validate());
    console.log("Number of addresses on whitelist");
    console.log(results.data.whitelist!.length);
    
    const whitelist: any[] = [];
    var i:number;
    for (let address of results.data.whitelist!){
        whitelist.push(address.plain());
    }
    //output of whitelist
    //console.log("Whitelist of addresses")
    //console.log(whitelist);

    //filtering duplicates/uniques
    var uniq = whitelist
        .map((name) => {
  return {count: 1, name: name}
        })
        .reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count
        return a
        }, {});

var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1)
    console.log("Number of duplicates");
    console.log(duplicates.length);
    //output of duplicates
    //console.log("List of duplicates");
    //console.log(duplicates);    

    //writing whitelist to disk
    var output: any[] = [];
    output.push("address");
    var i:number;
    for(let index in whitelist){
        output.push(whitelist[index]);
    }
    const nameOfOutputFile = "whitelist" + ".csv";
    fs.writeFile(nameOfOutputFile,
        output.join('\n') 
        ,function (err) { console.log(err ? 'Error :'+err : 'writing' + nameOfOutputFile + ' to disk ... ok') 
    });
    //writing duplicates to disk
    var duplicatesOutput: any[] = [];
    duplicatesOutput.push("address");
    var i:number;
    for(let index in whitelist){
        output.push(whitelist[index]);
    }
    const nameOfDuplicatesOutputFile = "duplicates" + ".csv";
    fs.writeFile(nameOfDuplicatesOutputFile,
        output.join('\n') 
        ,function (err) { console.log(err ? 'Error :'+err : 'writing' + nameOfDuplicatesOutputFile + ' to disk ... ok') 
    });

});
