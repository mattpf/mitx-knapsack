var KnapsackUI = function(container, model, controller) {
    var mContainer = $(container); // Force jQuery.
    var self = this; // 'this' is a remarkably finicky thing. Stash the real one.
    var mController = controller;
    var mKnapsack = model;
    // Main row
    var mItemView = $('<div class="item-collection area well span5">');
    var mBagView = $('<div class="bag-collection area well span5">');
    var mRow = $('<div class="row-fluid main-row">').append(mItemView, mBagView);
    // Title row
    var mItemTitle = $('<div class="span5">Available items ($<span class="price">10</span>)</div>');
    var mBagTitle = $('<div class="span5">Knapsack ($<span class="price">0</span>; <span class="mass">0</span> kg)</div>');
    var mItemPriceSpan = mItemTitle.find('.price');
    var mBagPriceSpan = mBagTitle.find('.price');
    var mBagMassSpan = mBagTitle.find('.mass');
    var mTitleRow = $('<div class="row-fluid titles">').append(mItemTitle, mBagTitle);

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
            revert: "invalid",
            zIndex: 100
        });
        return node;
    }

    // Changes the labels to reflect whether the item is still usable.
    var update_node_displays = function() {
        // Mark labels as problematic if they've over the mass limit.
        mItemView.children().each(function() {
            if(!mKnapsack.canAddToBag($(this).data('object'))) {
                $(this).find('.label').addClass('label-important');
            } else {
                $(this).find('.label').removeClass('label-important');
            }
        });
    }

    var update_titles = function() {
        mItemPriceSpan.text(mKnapsack.totalPrice() - mKnapsack.bagPrice());
        mBagMassSpan.text(mKnapsack.bagMass());
        mBagPriceSpan.text(mKnapsack.bagPrice());
    }

    // Callback when something is added to the pile.
    var handle_added_pile = function(o) {
        var node = create_node(o);
        mItemView.append(node);
        update_titles();
    };

    // Callback when something is removed from the pile.
    var handle_removed_pile = function(o) {
        if(!o.userdata.node) return;
        o.userdata.node.remove();
        update_titles();
    };

    // Callback when something is added to the bag.
    var handle_added_bag = function(o) {
        var node = create_node(o);
        mBagView.append(node);
        update_node_displays();
        update_titles();
    };

    // Callback when something is removed from the bag.
    var handle_removed_bag = function(o) {
        if(!o.userdata.node) return;
        o.userdata.node.remove();
        update_node_displays();
        update_titles();
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
        // While we're animating we want to appear on top of everything
        // already in the thing.
        // Since the pile is a prior sibling to the bag in the DOM, we
        // can't do that using z-index alone (it's in the wrong stacking
        // context). To work around, we move the element to mContainer, which
        // is parent to both boxes.
        element.appendTo(mContainer).css({
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            'z-index': 100
        }).animate({
            top: new_pos.top,
            left: new_pos.left
        }, function() {
            if(callback)
                callback(element.data('object'));
        });
    };

    // Pass this off to the controller to do something useful.
    var handle_item_drop = function(e, ui) {
        move_into_place(mItemView, ui.draggable, mController.itemRemovedFromBag);
    };

    var handle_bag_drop = function(e, ui) {
        move_into_place(mBagView, ui.draggable, mController.itemMovedToBag);
    };

    // Called while an item to the bag to see if that's valid.
    var check_bag_drop = function(node) {
        var o = node.data('object');
        if(!mKnapsack.hasInPile(o)) return false;
        return mKnapsack.canAddToBag(o);
    }

    var initialise = function() {
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
        mContainer.find('img').each(function() {
            var img = $(this);
            mKnapsack.addItem(
                img.data('name'),       // name
                img.data('mass'),       // mass
                img.data('price'),      // price
                {img: img.attr('src')}  // userdata (image url)
            );
        });

        // Now wipe it and build our own UI!
        mContainer.empty().append(mRow, mTitleRow);
        // Fix the heights of both boxes, now that we have some idea what they
        // should be.
        // *HACK: Chrome apparently has a race condition. This hacks around it in five minutes.
        setTimeout(function() {
            mBagView.css({height: mItemView.height()});
            mItemView.css({height: mItemView.height()});
        }, 100);
    };

    initialise();
};
