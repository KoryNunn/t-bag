var test = require('grape'),
    tBag = require('../'),
    timeoutMultiplyer = 1000;

function time(n){
    return n * timeoutMultiplyer;
}

if(typeof window === 'undefined'){
    (function(){
        var jsdom = require("jsdom").jsdom;
        var document = jsdom("<html><head></head><body>hello world</body></html>");
        var window = document.parentWindow;

        GLOBAL.window = window;
        GLOBAL.document = document;
        timeoutMultiplyer = 100;

    })();
}

function bagSettings(){
    return {
        hideTime: time(1),
        animationTime: time(0.1)
    };
}

test('bag', function(t){
    t.timeout(time(2));
    t.plan(2);

    var bag = new tBag.Bag('things', bagSettings());

    document.body.appendChild(bag.element);

    setTimeout(function(){
        t.ok(!bag.element.parentNode, 'Bag was automatically removed');
    },time(1.5));

    t.ok(bag.element.parentNode, 'Element has a parent node');
});

test('box', function(t){
    t.timeout(time(2));
    t.plan(3);

    var box = new tBag.Box(),
        bag;

    document.body.appendChild(box.element);

    setTimeout(function(){
        t.ok(box.element.parentNode, 'Box is still in the DOM');
        t.ok(!bag.element.parentNode, 'Bag was automatically removed');
    },time(1.5));

    t.ok(box.element.parentNode, 'Element has a parent node');

    bag = box.bag('things', bagSettings())
});