var $rdf = require('rdflib');

function merge(store1, store2) {
    var outStore = $rdf.graph();
    store1.statements.forEach((statement) => {
        outStore.add(statement);
    });
    store2.statements.forEach((statement) => {
        outStore.add(statement);
    });
    return outStore;
}

function main() {
    var store1 = $rdf.graph();
    var store2 = $rdf.graph();
    var ME = $rdf.Namespace("https://kezike.solid.community/profile/card#");
    var cred1 = ME('cred1');
    var cred2 = ME('cred2');
    var pred1 = ME('pred1');
    var pred2 = ME('pred2');
    var pred3 = ME('pred3');
    var obj1 = ME('obj1');
    var obj2 = ME('obj2');
    var obj3 = ME('obj3');
    store1.add(cred1, pred1, obj1);
    store1.add(cred2, pred2, obj2);
    store1.add(cred2, pred3, obj3);
    var mergedStores = merge(store1, store2);
    console.log(`Merged stores:\n${mergedStores}`);
}

main();
