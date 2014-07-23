(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var crel = require('crel'),
    doc = require('doc-js'),
    Consuela = require('consuela'),
    defaultHideTime = 4000;

function Bag(message, settings){
    var bag = this;

    this.consuela = new Consuela();

    if(!settings){
        settings = {};
    }

    this.animationTime = settings.animationTime || 300;

    this.element = crel('div', {'class':'bag'},
        message
    );

    // consuela for auto-debinding events;
    this.consuela.watch(this.element);

    if(!settings.sticky){
        setTimeout(function(){
            bag.remove();
        }, settings.hideTime || defaultHideTime);
    }
}
Bag.prototype.remove = function(){
    var bag = this,
        remove = this._remove.bind(this);

    doc(this.element)
        .addClass('removed')
        .on('animationend', remove);

    setTimeout(remove, this.animationTime);
};
Bag.prototype._remove = function(){
    var bagWrapper = this.element.parentNode;

    if (bagWrapper) {
        bagWrapper.removeChild(this.element);
        if (bagWrapper.children && !bagWrapper.children.length) {
            doc(bagWrapper.parentNode).addClass('tBagEmpty');
        }
    }

    // clean up events
    this.consuela.cleanup();
};

function Box(){
    this.element = crel('div', {'class':'tBox tBagEmpty'},
        this.bagWrapper = crel('div', {'class':'tBagWrapper'})
    );
}
Box.prototype.bag = function(message, settings){
    var bag = new Bag(message, settings);

    this.addBag(bag);

    return bag;
};
Box.prototype.addBag = function(bag){
    doc(this.element).removeClass('tBagEmpty');
    this.bagWrapper.appendChild(bag.element);
};

module.exports = {
    Box: Box,
    Bag: Bag
};
},{"consuela":2,"crel":3,"doc-js":5}],2:[function(require,module,exports){
function getListenerMethod(emitter, methodNames){
    if(typeof methodNames === 'string'){
        methodNames = methodNames.split(' ');
    }
    for(var i = 0; i < methodNames.length; i++){
        if(methodNames[i] in emitter){
            return methodNames[i];
        }
    }
}

function Consuela(){
    this._trackedListeners = [];
}
Consuela.prototype.onNames = 'on addListener addEventListener';
Consuela.prototype.offNames = 'off removeListener removeEventListener';
Consuela.prototype._on = function(emitter, args, offName){
    this._trackedListeners.push({
        emitter: emitter,
        args: Array.prototype.slice.call(args),
        offName: offName
    });
};
function compareArgs(args1, args2){
    if(args1.length !== args2.length){
        return;
    }
    for (var i = 0; i < args1.length; i++) {
        if(args1[i] !== args2[i]){
            return;
        }
    };
    return true;
}
Consuela.prototype._off = function(emitter, args, offName){
    for (var i = 0; i < this._trackedListeners.length; i++) {
        var info = this._trackedListeners[i];

        if(emitter !== info.emitter || !compareArgs(info.args, args)){
            continue;
        }

        this._trackedListeners.splice(i, 1);
        i--;
    };
};
Consuela.prototype.on = function(emitter, args, offName){
    var method = getListenerMethod(emitter, this.onNames),
        oldOn = emitter[method];

    this._on(emitter, args, offName);
    oldOn.apply(emitter, args);
};
Consuela.prototype.cleanup = function(){
    while(this._trackedListeners.length){
        var info = this._trackedListeners.pop(),
            emitter = info.emitter,
            offNames = this.offNames;

        if(info.offName){
            offNames = [info.offName];
        }

        emitter[getListenerMethod(info.emitter, offNames)]
            .apply(emitter, info.args);
    }
};
Consuela.prototype.watch = function(emitter, onName, offName){
    var consuela = this,
        onNames = this.onNames,
        offNames = this.offNames;

    if(onName){
        onNames = [onName];
    }

    var onMethod = getListenerMethod(emitter, onNames),
        oldOn = emitter[onMethod];

    if(emitter[onMethod].__isConsuelaOverride){
        return;
    }

    emitter[onMethod] = function(){
        consuela._on(emitter, arguments, offName);
        oldOn.apply(emitter, arguments);
    };
    emitter[onMethod].__isConsuelaOverride = true;


    if(offName){
        offNames = [offName];
    }

    var offMethod = getListenerMethod(emitter, offNames),
        oldOff = emitter[offMethod];

    if(emitter[offMethod].__isConsuelaOverride){
        return;
    }

    emitter[offMethod] = function(){
        consuela._off(emitter, arguments, offName);
        oldOff.apply(emitter, arguments);
    };
    emitter[offMethod].__isConsuelaOverride = true;
};

module.exports = Consuela;
},{}],3:[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    // based on http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    var isNode = typeof Node === 'function'
        ? function (object) { return object instanceof Node; }
        : function (object) {
            return object
                && typeof object === 'object'
                && typeof object.nodeType === 'number'
                && typeof object.nodeName === 'string';
        };
    var isArray = function(a){ return a instanceof Array; };
    var appendChild = function(element, child) {
      if(!isNode(child)){
          child = document.createTextNode(child);
      }
      element.appendChild(child);
    };


    function crel(){
        var document = window.document,
            args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel.attrMap;

        element = isNode(element) ? element : document.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(typeof settings !== 'object' || isNode(settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && typeof args[childIndex] === 'string' && element.textContent !== undefined){
            element.textContent = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element.setAttribute(key, settings[key]);
            }else{
                var attr = crel.attrMap[key];
                if(typeof attr === 'function'){
                    attr(element, settings[key]);
                }else{
                    element.setAttribute(attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    // String referenced so that compilers maintain the property name.
    crel['attrMap'] = {};

    // String referenced so that compilers maintain the property name.
    crel["isNode"] = isNode;

    return crel;
}));

},{}],4:[function(require,module,exports){
var doc = {
    document: typeof document !== 'undefined' ? document : null,
    setDocument: function(d){
        this.document = d;
    }
};

var arrayProto = [],
    isList = require('./isList');
    getTargets = require('./getTargets')(doc.document),
    getTarget = require('./getTarget')(doc.document),
    space = ' ';


///[README.md]

function isIn(array, item){
    for(var i = 0; i < array.length; i++) {
        if(item === array[i]){
            return true;
        }
    }
}

/**

    ## .find

    finds elements that match the query within the scope of target

        //fluent
        doc(target).find(query);

        //legacy
        doc.find(target, query);
*/

function find(target, query){
    target = getTargets(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var results = [];
        for (var i = 0; i < target.length; i++) {
            var subResults = doc.find(target[i], query);
            for(var j = 0; j < subResults.length; j++) {
                if(!isIn(results, subResults[j])){
                    results.push(subResults[j]);
                }
            }
        }
        return results;
    }

    return target ? target.querySelectorAll(query) : [];
};

/**

    ## .findOne

    finds the first element that matches the query within the scope of target

        //fluent
        doc(target).findOne(query);

        //legacy
        doc.findOne(target, query);
*/

function findOne(target, query){
    target = getTarget(target);
    if(query == null){
        return target;
    }

    if(isList(target)){
        var result;
        for (var i = 0; i < target.length; i++) {
            result = findOne(target[i], query);
            if(result){
                break;
            }
        }
        return result;
    }

    return target ? target.querySelector(query) : null;
};

/**

    ## .closest

    recurses up the DOM from the target node, checking if the current element matches the query

        //fluent
        doc(target).closest(query);

        //legacy
        doc.closest(target, query);
*/

function closest(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    while(
        target &&
        target.ownerDocument &&
        !is(target, query)
    ){
        target = target.parentNode;
    }

    return target === doc.document && target !== query ? null : target;
};

/**

    ## .is

    returns true if the target element matches the query

        //fluent
        doc(target).is(query);

        //legacy
        doc.is(target, query);
*/

function is(target, query){
    target = getTarget(target);

    if(isList(target)){
        target = target[0];
    }

    if(!target.ownerDocument || typeof query !== 'string'){
        return target === query;
    }
    return target === query || arrayProto.indexOf.call(find(target.parentNode, query), target) >= 0;
};

/**

    ## .addClass

    adds classes to the target

        //fluent
        doc(target).addClass(query);

        //legacy
        doc.addClass(target, query);
*/

function addClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            addClass(target[i], classes);
        }
        return this;
    }
    if(!classes){
        return this;
    }

    var classes = classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToAdd = classes[i];
        if(!classToAdd || classToAdd === space){
            continue;
        }
        if(target.classList){
            target.classList.add(classToAdd);
        } else if(!currentClasses.indexOf(classToAdd)>=0){
            currentClasses.push(classToAdd);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
};

/**

    ## .removeClass

    removes classes from the target

        //fluent
        doc(target).removeClass(query);

        //legacy
        doc.removeClass(target, query);
*/

function removeClass(target, classes){
    target = getTargets(target);

    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            removeClass(target[i], classes);
        }
        return this;
    }

    if(!classes){
        return this;
    }

    var classes = classes.split(space),
        currentClasses = target.classList ? null : target.className.split(space);

    for(var i = 0; i < classes.length; i++){
        var classToRemove = classes[i];
        if(!classToRemove || classToRemove === space){
            continue;
        }
        if(target.classList){
            target.classList.remove(classToRemove);
            continue;
        }
        var removeIndex = currentClasses.indexOf(classToRemove);
        if(removeIndex >= 0){
            currentClasses.splice(removeIndex, 1);
        }
    }
    if(!target.classList){
        target.className = currentClasses.join(space);
    }
    return this;
};

function addEvent(settings){
    var target = getTarget(settings.target);
    if(target){
        target.addEventListener(settings.event, settings.callback, false);
    }else{
        console.warn('No elements matched the selector, so no events were bound.');
    }
}

/**

    ## .on

    binds a callback to a target when a DOM event is raised.

        //fluent
        doc(target/proxy).on(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.on(events, target, query, proxy[optional]);
*/

function on(events, target, callback, proxy){

    proxy = getTargets(proxy);

    if(!proxy){
        target = getTargets(target);
        // handles multiple targets
        if(isList(target)){
            var multiRemoveCallbacks = [];
            for (var i = 0; i < target.length; i++) {
                multiRemoveCallbacks.push(on(events, target[i], callback, proxy));
            }
            return function(){
                while(multiRemoveCallbacks.length){
                    multiRemoveCallbacks.pop();
                }
            };
        }
    }

    // handles multiple proxies
    // Already handles multiple proxies and targets,
    // because the target loop calls this loop.
    if(isList(proxy)){
        var multiRemoveCallbacks = [];
        for (var i = 0; i < proxy.length; i++) {
            multiRemoveCallbacks.push(on(events, target, callback, proxy[i]));
        }
        return function(){
            while(multiRemoveCallbacks.length){
                multiRemoveCallbacks.pop();
            }
        };
    }

    var removeCallbacks = [];

    if(typeof events === 'string'){
        events = events.split(space);
    }

    for(var i = 0; i < events.length; i++){
        var eventSettings = {};
        if(proxy){
            if(proxy === true){
                proxy = doc.document;
            }
            eventSettings.target = proxy;
            eventSettings.callback = function(event){
                var closestTarget = closest(event.target, target);
                if(closestTarget){
                    callback(event, closestTarget);
                }
            };
        }else{
            eventSettings.target = target;
            eventSettings.callback = callback;
        }

        eventSettings.event = events[i];

        addEvent(eventSettings);

        removeCallbacks.push(eventSettings);
    }

    return function(){
        while(removeCallbacks.length){
            var removeCallback = removeCallbacks.pop();
            getTarget(removeCallback.target).removeEventListener(removeCallback.event, removeCallback.callback);
        }
    }
};

/**

    ## .off

    removes events assigned to a target.

        //fluent
        doc(target/proxy).off(events, target[optional], callback);

    note: if a target is passed to the .on function, doc's target will be used as the proxy.

        //legacy
        doc.off(events, target, callback, proxy);
*/

function off(events, target, callback, proxy){
    if(isList(target)){
        for (var i = 0; i < target.length; i++) {
            off(events, target[i], callback, proxy);
        }
        return this;
    }
    if(proxy instanceof Array){
        for (var i = 0; i < proxy.length; i++) {
            off(events, target, callback, proxy[i]);
        }
        return this;
    }

    if(typeof events === 'string'){
        events = events.split(space);
    }

    if(typeof callback !== 'function'){
        proxy = callback;
        callback = null;
    }

    proxy = proxy ? getTarget(proxy) : doc.document;

    var targets = typeof target === 'string' ? find(target, proxy) : [target];

    for(var targetIndex = 0; targetIndex < targets.length; targetIndex++){
        var currentTarget = targets[targetIndex];

        for(var i = 0; i < events.length; i++){
            currentTarget.removeEventListener(events[i], callback);
        }
    }
    return this;
};

/**

    ## .append

    adds elements to a target

        //fluent
        doc(target).append(children);

        //legacy
        doc.append(target, children);
*/

function append(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        for (var i = 0; i < children.length; i++) {
            append(target, children[i]);
        }
        return;
    }

    target.appendChild(children);
};

/**

    ## .prepend

    adds elements to the front of a target

        //fluent
        doc(target).prepend(children);

        //legacy
        doc.prepend(target, children);
*/

function prepend(target, children){
    var target = getTarget(target),
        children = getTarget(children);

    if(isList(target)){
        target = target[0];
    }

    if(isList(children)){
        //reversed because otherwise the would get put in in the wrong order.
        for (var i = children.length -1; i; i--) {
            prepend(target, children[i]);
        }
        return;
    }

    target.insertBefore(children, target.firstChild);
};

/**

    ## .isVisible

    checks if an element or any of its parents display properties are set to 'none'

        //fluent
        doc(target).isVisible();

        //legacy
        doc.isVisible(target);
*/

function isVisible(target){
    var target = getTarget(target);
    if(!target){
        return;
    }
    if(isList(target)){
        var i = -1;

        while (target[i++] && isVisible(target[i])) {}
        return target.length >= i;
    }
    while(target.parentNode && target.style.display !== 'none'){
        target = target.parentNode;
    }

    return target === doc.document;
};



/**

    ## .ready

    call a callback when the document is ready.

        //fluent
        doc().ready(callback);

        //legacy
        doc.ready(callback);
*/

function ready(target, callback){
    if(typeof target === 'function' && !callback){
        callback = target;
    }
    if(doc.document.body){
        callback();
    }else{
        doc.on('load', window, function(){
            callback();
        });
    }
};

doc.find = find;
doc.findOne = findOne;
doc.closest = closest;
doc.is = is;
doc.addClass = addClass;
doc.removeClass = removeClass;
doc.off = off;
doc.on = on;
doc.append = append;
doc.prepend = prepend;
doc.isVisible = isVisible;
doc.ready = ready;

module.exports = doc;
},{"./getTarget":6,"./getTargets":7,"./isList":8}],5:[function(require,module,exports){
var doc = require('./doc'),
    isList = require('./isList'),
    getTargets = require('./getTargets')(doc.document),
    flocProto = [];

function Floc(items){
    this.push.apply(this, items);
}
Floc.prototype = flocProto;
flocProto.constructor = Floc;

function floc(target){
    var instance = getTargets(target);

    if(!isList(instance)){
        if(instance){
            instance = [instance];
        }else{
            instance = [];
        }
    }
    return new Floc(instance);
}

var returnsSelf = 'addClass removeClass append prepend'.split(' ');

for(var key in doc){
    if(typeof doc[key] === 'function'){
        floc[key] = doc[key];
        flocProto[key] = (function(key){
            var instance = this;
            // This is also extremely dodgy and fast
            return function(a,b,c,d,e,f){
                var result = doc[key](this, a,b,c,d,e,f);

                if(result !== doc && isList(result)){
                    return floc(result);
                }
                if(returnsSelf.indexOf(key) >=0){
                    return instance;
                }
                return result;
            };
        }(key));
    }
}
flocProto.on = function(events, target, callback){
    var proxy = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        proxy = null;
    }
    doc.on(events, target, callback, proxy);
    return this;
};

flocProto.off = function(events, target, callback){
    var reference = this;
    if(typeof target === 'function'){
        callback = target;
        target = this;
        reference = null;
    }
    doc.off(events, target, callback, reference);
    return this;
};

flocProto.addClass = function(className){
    doc.addClass(this, className);
    return this;
};

flocProto.removeClass = function(className){
    doc.removeClass(this, className);
    return this;
};

module.exports = floc;
},{"./doc":4,"./getTargets":7,"./isList":8}],6:[function(require,module,exports){
var singleId = /^#\w+$/;

module.exports = function(document){
    return function getTarget(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                return document.getElementById(target.slice(1));
            }
            return document.querySelector(target);
        }

        return target;
    };
};
},{}],7:[function(require,module,exports){

var singleClass = /^\.\w+$/,
    singleId = /^#\w+$/,
    singleTag = /^\w+$/;

module.exports = function(document){
    return function getTargets(target){
        if(typeof target === 'string'){
            if(singleId.exec(target)){
                // If you have more than 1 of the same id in your page,
                // thats your own stupid fault.
                return [document.getElementById(target.slice(1))];
            }
            if(singleTag.exec(target)){
                return document.getElementsByTagName(target);
            }
            if(singleClass.exec(target)){
                return document.getElementsByClassName(target.slice(1));
            }
            return document.querySelectorAll(target);
        }

        return target;
    };
};
},{}],8:[function(require,module,exports){
module.exports = function isList(object){
    return object !== window && (
        object instanceof Array ||
        (typeof HTMLCollection !== 'undefined' && object instanceof HTMLCollection) ||
        (typeof NodeList !== 'undefined' && object instanceof NodeList) ||
        Array.isArray(object)
    );
}

},{}],9:[function(require,module,exports){
(function (process){
var EventEmitter = require('events').EventEmitter,
    deepEqual = require('deep-equal'),
    encodeResults = require('./results');

var nextTick = process && process.nextTick || setTimeout;


function instantiate(){
    var testsToRun = [],
        testsRun = [],
        totalTests = 0,
        totalAssersions = 0,
        completedAssersions = 0,
        begun = false,
        timeout = 0,
        only;

    function Test(name, testFunction){
        this._plan = 0;
        this._count = 0;
        this._assersions = [];
        this.name = name;
        this._testFunction = testFunction;
    }

    // Unused currently.
    // Test.prototype = Object.create(EventEmitter.prototype);
    // Test.prototype.constructor = Test;

    function setTestTimeout(time){
        timeout = Math.max(timeout, time);
    }

    Test.prototype.timeout = setTestTimeout;

    Test.prototype.comment = function (message) {
        // ToDo
    };

    Test.prototype.plan = function(ammount){
        this._plan = ammount;
    };

    Test.prototype._run = function(){
        var test = this;
        try {
            test._testFunction(this);
        }
        catch (err) {
            test.error(err);
        }
    };

    Test.prototype._assert = function(details){
        if(details.operator !== 'end'){
            this._count++;
        }
        if(this._ended){
            if(details.operator === 'end' || details.operator === 'fail'){
                return;
            }
            this.fail('asserted after test has ended');
        }
        this._assersions.push(details);
    };

    Test.prototype.end = function (message) {
        var ok = this._plan === this._count;

        if(this._ended){
            return;
        }

        if(ok){
            this._assert({
                ok: true,
                message: message,
                operator: 'end'
            });
        }else{
            this._assert({
                ok: false,
                expected: this._plan,
                actual: this._count,
                message: 'plan != count',
                operator: 'end'
            });
        }

        this._ended = true;
    };

    Test.prototype.error = function(error, message){
        this._assert({
            ok: !error,
            message : message || String(error),
            operator : 'error',
            actual : error
        });
    };

    Test.prototype.pass = function(message){
        this._assert({
            ok: true,
            message: message,
            operator: 'pass'
        });
    };

    Test.prototype.fail = function(message){
        this._assert({
            message: message,
            operator: 'fail'
        });
    };

    Test.prototype.skip = function(message){
        this._assert({
            message: message,
            skip: true,
            operator: 'skip'
        });
    };

    Test.prototype.ok = function(value, message){
        this._assert({
            actual: value,
            ok: !!value,
            message: message,
            operator: 'ok'
        });
    };

    Test.prototype.notOk = function(value, message){
        this._assert({
            actual: value,
            ok:!value,
            message: message,
            operator: 'notOk'
        });
    };

    Test.prototype.equal = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: value === expected,
            message: message,
            operator: 'equal'
        });
    };

    Test.prototype.notEqual = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: value !== expected,
            message: message,
            operator: 'notEqual'
        });
    };

    Test.prototype.deepEqual = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: deepEqual(value, expected, { strict: true }),
            message: message,
            operator: 'deepEqual'
        });
    };

    Test.prototype.deepLooseEqual = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: deepEqual(value, expected),
            message: message,
            operator: 'deepLooseEqual'
        });
    };

    Test.prototype.notDeepEqual = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: !deepEqual(value, expected, { strict: true }),
            message: message,
            operator: 'notDeepEqual'
        });
    };

    Test.prototype.notDeepLooseEqual = function(value, expected, message){
        this._assert({
            actual: value,
            expected: expected,
            ok: !deepEqual(value, expected),
            message: message,
            operator: 'notDeepLooseEqual'
        });
    };

    Test.prototype['throws'] = function (fn, expected, message) {
        var caughtError,
            passed;

        if(typeof expected === 'string'){
            message = expected;
            expected = undefined;
        }

        try{
            fn();
        }catch(error){
            caughtError = {error: error};
        }

        passed = caughtError;

        if(expected instanceof RegExp){
            passed = expected.test(caughtError && caughtError.error);
            expected = String(expected);
        }

        this._assert({
            ok: passed,
            message : message || 'should throw',
            operator : 'throws',
            actual : caughtError && caughtError.error,
            expected : expected,
            error: !passed && caughtError && caughtError.error
        });
    };

    Test.prototype.doesNotThrow = function (fn, expected, message) {
        var caughtError;

        if(typeof expected === 'string'){
            message = expected;
            expected = undefined;
        }

        try{
            fn();
        }catch(error){
            caughtError = { error : error };
        }

        this._assert({
            ok: !caughtError,
            message: message || 'should not throw',
            operator: 'doesNotThrow',
            actual: caughtError && caughtError.error,
            expected: expected,
            error: caughtError && caughtError.error
        });
    };

    function runNextTest(){
        while(testsToRun.length){
            var nextTest = testsToRun.shift();
            nextTest._run();
            testsRun.push(nextTest);
        }
    }

    function complete(){
        var results = encodeResults(testsRun);

        if(testsToRun.length !== totalTests){
            // tests level problem
        }

        grape.emit('complete', results[0]);

        if(!grape.silent){
            console.log(results[0]);
            if(process && process.exit){
                process.exit(results[1]);
            }
        }
    }

    function begin(){
        if(!begun){
            begun = true;
            nextTick(runNextTest);
            nextTick(function(){
                if(!process || !process.on || grape.useTimeout){
                    setTimeout(complete, timeout);
                }else{
                    process.on('exit', complete);
                }
            });
        }
    }

    function grape(name, testFunction){
        if(only){
            return;
        }
        totalTests++;
        testsToRun.push(new Test(name, testFunction));
        begin();
    }
    grape.timeout = setTestTimeout;

    grape.only = function(name, testFunction){
        if(only){
            throw "There can be only one only";
        }
        only = true;
        testsToRun = [new Test(name, testFunction)];
        begin();
    };

    for(var key in EventEmitter.prototype){
        grape[key] = EventEmitter.prototype[key];
    }

    grape.createNewInstance = instantiate;
    grape.Test = Test;

    return grape;
}

module.exports = instantiate();

}).call(this,require("/usr/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./results":13,"/usr/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":16,"deep-equal":10,"events":15}],10:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function objEquiv(a, b, opts) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return true;
}

},{"./lib/is_arguments.js":11,"./lib/keys.js":12}],11:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],12:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],13:[function(require,module,exports){

// Taken from https://github.com/substack/tape/blob/master/lib/results.js

function encodeResult (result, count) {
    var output = '';
    output += (result.ok ? 'ok ' : 'not ok ') + count;
    output += result.message ? ' ' + result.message.toString().replace(/\s+/g, ' ') : '';

    if (result.skip) output += ' # SKIP';
    else if (result.todo) output += ' # TODO';

    output += '\n';
    if (result.ok) return output;

    var outer = '  ';
    var inner = outer + '  ';
    output += outer + '---\n';
    output += inner + 'operator: ' + result.operator + '\n';

    var ex = JSON.stringify(result.expected) || '';
    var ac = JSON.stringify(result.actual) || '';

    if (Math.max(ex.length, ac.length) > 65) {
        output += inner + 'expected:\n' + inner + '  ' + ex + '\n';
        output += inner + 'actual:\n' + inner + '  ' + ac + '\n';
    }
    else {
        output += inner + 'expected: ' + ex + '\n';
        output += inner + 'actual:   ' + ac + '\n';
    }
    if (result.at) {
        output += inner + 'at: ' + result.at + '\n';
    }
    if (result.operator === 'error' && result.actual && result.actual.stack) {
        var lines = String(result.actual.stack).split('\n');
        output += inner + 'stack:\n';
        output += inner + '  ' + lines[0] + '\n';
        for (var i = 1; i < lines.length; i++) {
            output += inner + lines[i] + '\n';
        }
    }

    output += outer + '...\n';
    return output;
}

function encodeResults(results){
    var output = '',
        count = 0,
        passed = 0,
        failed = 0;

    for(var i = 0; i < results.length; i++) {
        var test = results[i];

        output += '# ' + test.name + '\n';

        if(test._plan !== test._count){
            test._assert({
                ok: false,
                expected: test._plan,
                actual: test._count,
                message: 'plan != count',
                operator: 'end'
            });
        }

        for(var j = 0; j < test._assersions.length; j++) {
            var assersion = test._assersions[j];
            count++;

            if(assersion.ok){
                passed++;
            }else{
                failed++;
            }

            output += encodeResult(assersion, count);
        }
    }

    output += '\n1..' + count + '\n';
    output += '# tests ' + count + '\n';
    output += '# pass  ' + passed + '\n';

    if(failed) {
        output += '# fail  ' + failed + '\n';
    }else{
        output += '\n# ok\n';
    }

    return [output, failed];
}

module.exports = encodeResults;
},{}],14:[function(require,module,exports){
var test = require('grape'),
    tBag = require('../'),
    timeoutMultiplyer = 1000;

function time(n){
    return n * timeoutMultiplyer;
}

// if(typeof window === 'undefined'){
//     (function(){
//         var jsdom = require("jsdom").jsdom;
//         var document = jsdom("<html><head></head><body>hello world</body></html>");
//         var window = document.parentWindow;

//         GLOBAL.window = window;
//         GLOBAL.document = document;
//         timeoutMultiplyer = 100;

//     })();
// }

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
    t.plan(6);

    var box = new tBag.Box(),
        bag;

    document.body.appendChild(box.element);

    setTimeout(function(){
        t.ok(box.element.parentNode, 'Box is still in the DOM');
        t.ok(!bag.element.parentNode, 'Bag was automatically removed');
        t.equal(box.element.className, 'tBox tBagEmpty' , 'tBagEmpty class added to tBox after empty');
    },time(1.5));

    t.ok(box.element.parentNode, 'Element has a parent node');
    t.equal(box.element.className, 'tBox tBagEmpty' , 'tBagEmpty class added to tBox');

    bag = box.bag('things', bagSettings());

    t.equal(box.element.className, 'tBox' , 'tBagEmpty class removed after adding bag');
});


test('events clean', function(t){
    t.timeout(time(2));
    t.plan(3);

    var bag = new tBag.Bag('things', bagSettings());

    bag.element.addEventListener('click', function(){
        t.pass('Recieved one click event');
    });

    bag.element.click();

    document.body.appendChild(bag.element);

    setTimeout(function(){
        t.ok(!bag.element.parentNode, 'Bag was automatically removed');
        bag.element.click();
    },time(1.5));

    t.ok(bag.element.parentNode, 'Element has a parent node');
});
},{"../":1,"grape":9}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],16:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[14])