# T-Bag

Like a toast, but dangling from above..

## Usage:

require it:

    var tBag = require('t-bag');

Make a t box:

    var box = new tBag.Box('things');

Show a bag:

    box.bag('Some message' [, settings]);

You can optionally pass DOM as the first argument, and it will be inserted as a child of the box element.

Which will go away after 4 seconds by default.

## Settings:

### sticky

Whether to auto-remove the message after hideTime

### hideTime

How long to wait to auto-hide the message

### animationTime

How long to wait to remove the element from the DOM, after hiding. Useful if you want to animate the element's removal.