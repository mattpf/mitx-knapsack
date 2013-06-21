var KnapsackUI = function(container, model, controller) {
    container = $(container); // Force jQuery.
    var self = this; // 'this' is a remarkably finicky thing. Stash the real one.
    var mController = controller;
    var mItemView = $('<div class="item-collection area well span6">');
    var mBagView = $('<div class="bag-collection area well span6">');
    var mRow = $('<div class="row-fluid">').append(mItemView, mBagView);
    var mKnapsack = model;

    var create_node = function(o) {
        // If we already have a node, just return it.
        // Make sure we wipe any funny styles it has.
        var node = null;
        if(o.userdata.node) {
            node = o.userdata.node.removeAttr('style');
        } else { 
        // Otherwise build a new one.
            node = $('<div class="object">');
            var label = $('<p class="label">').append(o.name + ' ($' + o.price + '; ' + o.mass + 'kg)');
            var img = $('<img>').attr('src', o.userdata.img);
            node.append(img, label);
        }
        // Note that this pair creates a psuedo-circular reference.
        o.userdata.node = node;
        node.data('object', o);

        node.draggable({
            revert: "invalid"
        });
        return node;
    }

    var handle_added_pile = function(o) {
        var node = create_node(o);
        mItemView.append(node);
    };

    var handle_removed_pile = function(o) {
        if(!o.userdata.node) return;
        o.userdata.node.remove();
    };

    var handle_added_bag = function(o) {
        var node = create_node(o);
        console.log(node);
        mBagView.append(node);
    };

    var handle_removed_bag = function(o) {
        if(!o.userdata.node) return;
        o.userdata.node.remove();
    };

    var move_into_place = function(new_parent, element, callback) {
        // Animate a dropped element into its spot in the grid.
        // To do this, we create a shim element in the new parent,
        // grab its coordinates  (which is where our object should go),
        // then delete it.
        // We can then animate our object to the coordinates we grabbed.
        // This doesn't handle actually changing the object's parent;
        // that's done when we get a message from the model telling us that
        // the object has moved.
        // (TODO: we could do that here, but should we?)
        var pos = element.offset();
        var indicator = $('<div class="object">').appendTo(new_parent);
        var new_pos = indicator.offset();
        indicator.remove();
        element.css({
            position: 'absolute',
            top: pos.top,
            left: pos.left
        }).animate({
            top: new_pos.top,
            left: new_pos.left
        }, function() {
            console.log(callback);
            if(callback)
                callback(element.data('object'));
        });
    };

    var handle_item_drop = function(e, ui) {
        move_into_place(mItemView, ui.draggable, mController.itemRemovedFromBag);
    };

    var handle_bag_drop = function(e, ui) {
        move_into_place(mBagView, ui.draggable, mController.itemMovedToBag);
    };

    var check_bag_drop = function(node) {
        var o = node.data('object');
        if(!mKnapsack.hasInPile(o)) return false;
        return mKnapsack.canAddToBag(o);
    }

    this.initialise = function() {
        // Set up drag/drop on our containers.
        mItemView.droppable({
            accept: '.bag-collection .object'
        }).on('drop', handle_item_drop);
        mBagView.droppable({
            accept: check_bag_drop
        }).on('drop', handle_bag_drop);

        // We want to build a new element when a new item is created.
        // We need to do this now because we're going to start causing these
        // callbacks once we're processing the already-existing images.
        mKnapsack.on('added:pile', handle_added_pile);
        mKnapsack.on('removed:pile', handle_removed_pile);
        mKnapsack.on('added:bag', handle_added_bag);
        mKnapsack.on('removed:bag', handle_removed_bag);

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
        // Fix the heights of both boxes, now that we have some idea what they
        // should be.
        mBagView.css({height: mItemView.height()});
        mItemView.css({height: mItemView.height()});
    };

    this.initialise();
};
