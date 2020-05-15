var Fuse = require("fuse.js/dist/fuse.common.js");

onmessage = function(e) {
    let logs = e.data[0];
    let query = e.data[1];
    let version = e.data[2];
    let fuse = new Fuse(logs, {
        useExtendedSearch: true,
        shouldSort: false,
        keys: ['tags'],
    });
    postMessage([version, fuse.search(query).map(x => x.item)]);
};
