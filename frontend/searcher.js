var Fuse = require("fuse.js/dist/fuse.common.js");

onmessage = function(e) {
    let fuse = new Fuse(e.data.logs, {
        useExtendedSearch: true,
        shouldSort: false,
        keys: ['tags'],
    });
    postMessage({
        version: e.data.version,
        logs: fuse.search(e.data.query).map(x => x.item)
    });
};
