var KnapsackProgress = function(container, model) {
    var mContainer = $(container);
    var mKnapsack = model;
    var mMassBar, mPriceBar;

    mContainer.append('<hr>');

    var update_bars = function() {
        mPriceBar.css('width', (mKnapsack.bagPrice() / mKnapsack.totalPrice() * 100) + '%');
        mMassBar.css('width', (mKnapsack.bagMass() / mKnapsack.maxBagMass() * 100) + '%');
        if(mKnapsack.availableSpace() == 0) {
            mMassBar.parent().addClass('progress-danger').removeClass('progress-warning');
        } else {
            mMassBar.parent().addClass('progress-warning').removeClass('progress-danger');
        }
    }

    var initialise = function() {
        var row = $('<div class="row-fluid knapsack-bars">');

        var leftBox = $('<div class="span6">');
        var priceHolder = $('<div class="progress progress-success">');
        var priceLabel = $('<div class="bar-title">Knapsack value</div>');
        mPriceBar = $('<div class="bar" style="width: 0%;">');
        row.append(leftBox.append(priceHolder.append(mPriceBar, priceLabel)));
        mContainer.append(row);

        var rightBox = $('<div class="span6">');
        var massHolder = $('<div class="progress progress-warning">');
        var massLabel = $('<div class="bar-title">Knapsack mass</div>');
        mMassBar = $('<div class="bar" style="width: 0%;">');
        row.append(rightBox.append(massHolder.append(mMassBar, massLabel)));
        mContainer.append(row);

        mKnapsack.on('added:bag removed:bag', update_bars);
    };

    initialise();
};
