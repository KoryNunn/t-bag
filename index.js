var crel = require('crel'),
    doc = require('doc-js'),
    Consuela = require('consuela'),
    defaultHideTime = 4000;

function Bag(message, settings){
    var bag = this;

    if(!settings){
        settings = {};
    }

    this.animationTime = settings.animationTime || 300;

    this.element = crel('div', {'class':'bag'},
        message
    );

    // this is a 'consuela', which can auto-debind events);
    this._watch(this.element);

    if(!settings.sticky){
        setTimeout(function(){
            bag.remove();
        }, settings.hideTime || defaultHideTime);
    }
}
Bag = Consuela.init(Bag);
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
    this._cleanup();
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