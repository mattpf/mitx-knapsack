// This deals with persisting state. It restores state on creation,
// and stores it when it changes.

// Because localStorage can only store strings, we use JSON to persist our data.
// Further, to avoid potential issues with cyclic structures and similar, we
// collapse the stored items to a list of ids, which we restore to actual items
// on restoration.
var KnapsackPersister = function(model) {
    model.on('added:bag removed:bag', function() {
        localStorage['kpBagContents'] = JSON.stringify(
            _.map(model.bagItems(), function(item) {
                return item.id; 
            })
        );
    });

    // *HACK: Chrome apparently has a race condition. This hacks around it in five minutes.
    setTimeout(function() {
    if(localStorage['kpBagContents']) {
        var ids = JSON.parse(localStorage['kpBagContents']);
        for(var i = 0; i < ids.length; ++i) {
            try {
                model.moveToBag(model.getItemById(ids[i]));
            } catch(e) {
                console.log("State restoration failed:", e);
            }
        }
    }
    }, 110);
};
