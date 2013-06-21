var KnapsackBest = function(container, model) {
    var mContainer = $(container);
    var mKnapsack = model;
    var mList = $('<ul>');
    var mCurrentBest = 0;
    var mBestItems = [];
    var mTotal = $('<span>0</span>');

    var update_best = function() {
        mList.empty();
        for(var i = 0; i < mBestItems.length; ++i) {
            var item = mBestItems[i];
            mList.append($('<li>').text(item.name + ' ($' + item.price + ')'));
        }

        mTotal.text(mCurrentBest);

        // Persist our list. See knapsack_persist.js for the reasoning.
        var best_ids = _.map(mBestItems, function(item) { return item.id; });
        localStorage['kbBestData'] = JSON.stringify({price: mCurrentBest, items: best_ids});
    }

    var initialise = function() {
        mContainer.append('<h4>Best Items</h4>');
        mContainer.append(mList);
        mContainer.append('<hr>');
        mContainer.append($('<div class="total">Total: $</div>').append(mTotal));

        mKnapsack.on('added:bag', function(o) {
            if(mKnapsack.bagPrice() > mCurrentBest) {
                mCurrentBest = mKnapsack.bagPrice();
                mBestItems = _.values(mKnapsack.bagItems());
                update_best();
            }
        });

        // Restore our persisted data, if we have it.
        if(localStorage['kbBestData']) {
            var data = JSON.parse(localStorage['kbBestData']);
            mCurrentBest = data.price;
            mBestItems = _.map(data.items, function(id) { return mKnapsack.getItemById(id); });
            update_best();
        }
    };

    initialise();
};
