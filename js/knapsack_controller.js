var KnapsackController = function(model) {
    var mModel = model;
    var self = this;

    this.itemMovedToBag = function(o) {
        mModel.moveToBag(o);
    };

    this.itemRemovedFromBag = function(o) {
        mModel.removeFromBag(o);
    }
};
