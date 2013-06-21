var knapsack;

$(function() {
    var container = $('.knapsack');
     knapsack = new Knapsack(container.data('max-mass'))
    var controller = new KnapsackController(knapsack);

    new KnapsackUI(container, knapsack, controller);
});