$(function() {
    var container = $('.knapsack');
    var knapsack = new Knapsack(container.data('max-mass'))
    var controller = new KnapsackController(knapsack);

    new KnapsackUI(container, knapsack, controller);
    new KnapsackProgress(container, knapsack);
});