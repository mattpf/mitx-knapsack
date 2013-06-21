$(function() {
    var container = $('.knapsack');
    var knapsack = new Knapsack(container.data('max-mass'))
    var controller = new KnapsackController(knapsack);

    new KnapsackUI(container, knapsack, controller);
    new KnapsackProgress(container, knapsack);
    new KnapsackPersister(knapsack);

    // KnapsackBest expects to have a space set up for it already.
    var mainRow = container.find('.main-row');
    var bestContainer = $('<div class="span2 best">');
    mainRow.append(bestContainer);
    new KnapsackBest(bestContainer, knapsack);
});