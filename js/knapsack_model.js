var Knapsack = function(max_bag_mass) {
    var mUncollectedObjects = {};
    var mCollectedObjects = {};
    var mMaxBagMass = max_bag_mass;

    var mBagMass = 0;
    var mBagPrice = 0;
    var mTotalMass = 0;
    var mTotalPrice = 0;

    var mCurrentID = 0;

    _.extend(this, Backbone.Events);

    this.availableSpace = function() {
        return mMaxBagMass - mBagMass;
    };

    this.canAddToBag = function(o) {
        return mBagMass + o.mass <= mMaxBagMass;
    };

    this.hasInBag = function(o) {
        return _.has(mCollectedObjects, o.id);
    };

    this.hasInPile = function(o) {
        return _.has(mUncollectedObjects, o.id);
    };

    this.moveToBag = function(o) {
        if(!this.canAddToBag(o)) {
            throw "That won't fit!";
        }

        if(!this.hasInPile(o)) {
            throw "That object is not in the set of uncollected objects.";
        }

        mCollectedObjects[o.id] = o;
        delete mUncollectedObjects[o.id];
        mBagMass += o.mass;
        mBagPrice += o.price;

        this.trigger('removed:pile', o);
        this.trigger('added:bag', o);
        this.trigger('moved:pile_bag', o);
        return true;
    };

    this.removeFromBag = function(o) {
        if(!this.hasInBag(o)) {
            throw "That object isn't in the bag!";
        }

        mUncollectedObjects[o.id] = 0;
        delete mCollectedObjects[o.id];
        mBagMass -= o.mass;
        mBagPrice -= o.price;

        this.trigger('removed:bag', o);
        this.trigger('added:pile', o);
        this.trigger('moved:bag_pile', o);
        return true;
    };

    this.addItem = function(name, mass, price, userdata) {
        var o = {
            name: name,
            mass: mass,
            price: price,
            id: mCurrentID++
        };
        if(userdata !== undefined) {
            o.userdata = userdata;
        }
        mUncollectedObjects[o.id] = o;
        mTotalMass += o.mass;
        mTotalPrice += o.price;

        this.trigger('added:pile', o);
        return true;
    };

    this.getItemById = function(id) {
        if(_.has(mCollectedObjects, id)) return mCollectedObjects[id];
        if(_.has(mUncollectedObjects, id)) return mUncollectedObjects[id];
        return null;
    };

    this.bagMass = function() { return mBagMass; };
    this.bagPrice = function() { return mBagPrice; };
    this.totalMass = function() { return mTotalMass; };
    this.totalPrice = function() { return mTotalPrice; };
    this.maxBagMass = function() { return mMaxBagMass; };
    this.bagItems = function() { return _.extend({}, mCollectedObjects); } // return a copy
};
