var KnapsackUI = function(container) {
    container = $(container); // Force jQuery.
    var self = this; // 'this' is a remarkably finicky thing. Stash the real one.
    var mItemView = $('<div class="item-collection area well span6">');
    var mBagView = $('<div class="bag-collection area well span6">');
    var mRow = $('<div class="row-fluid">').append(mItemView, mBagView);
    var mKnapsack = new Knapsack(container.data('max-mass'));

    var handle_added_pile = function(o) {
        var node = $('<div class="object">');
        var label = $('<p class="label">').append(o.name + ' ($' + o.price + '; ' + o.mass + 'kg)');
        var img = $('<img>').attr('src', o.userdata.img);
        node.append(img, label);
        o.userdata.node = node;
        mItemView.append(node);
    };

    this.initialise = function() {
        // We want to build a new element when a new item is created.
        // We need to do this now because we're going to start causing these
        // callbacks once we're processing the already-existing images.
        mKnapsack.on('added:pile', handle_added_pile);
        // mKnapsack.on('removed:pile', handle_removed_pile);
        // mKnapsack.on('added:bag', handle_added_bag);
        // mKnapsack.on('removed:bag', handle_removed_bag);

        // Pull out our original contents.
        container.find('img').each(function() {
            var img = $(this);
            mKnapsack.addItem(
                img.data('name'),       // name
                img.data('mass'),       // mass
                img.data('price'),      // price
                {img: img.attr('src')}  // userdata (image url)
            );
        });

        // Now wipe it and build our own UI!
        container.empty().append(mRow);
    };

    this.initialise();
};

$(function() {
    $('.knapsack').each(function() {
        new KnapsackUI(this);
    });
});
