# Flickable.js -- A Zepto Plugin to Enable Touch Gestures on Any HTML Element

Zepto is great for handling basic gesture events, but for more complex touch interactions it can be lacking. Flickable allows you to make any element touchable; useful for flicking between sections, or sliding elements around the page.

Primary target platforms are:

* iOS 5+
* Android 2.2+

## v1.0.4 -- Fixed bug introduced with 1.0.3

Oops, somehow I managed to break the touch movement with 1.0.3 without noticing. Sorry about that -- I've fixed it with 1.0.4!

Big thanks to [Hay](https://github.com/hay) for bringing this to my attention :)

## Detailed Info and Pretty Diagrams

I've written a post with a lot of info here: 
http://labs.kojo.com.au/flickable-zepto-plugin/

## Demos

BYO touchscreen. 

* [Page Flipper](http://labs.kojo.com.au/demos/flickable/demo1.html): This demo allows you to swipe between 'cards' within a set area. Tap a card to flip it around.
* [Thumbnail Slider](http://labs.kojo.com.au/demos/flickable/demo2.html): This is similar to the way the App Store allows you to flip through app screenshots, but it can also be used to allow users to slide through navigation items that don't fit within a single page.
* [Vertical Jigsaw](http://labs.kojo.com.au/demos/flickable/demo3.html): Swipe up or down on the three segments to match up the images.


## Installation

Make sure you load flickable after Zepto

``` html
<script type="text/javascript" src="libs/zepto.min.js"></script>
<script type="text/javascript" src="plugins/zepto.flickable.js"></script>
```


## Usage

To use it, simply target the element you want to be Flickable, and apply the plugin to it. At minimum you should provide the number of segments Flickable will slice the element. 

HTML: 

``` html
<div id="wrapper">
  <ul id="flickable-element">
    <li>Content</li>
    <li>Content</li>
    <li>Content</li>
  </ul>
</div>
```

JavaScript: 

``` js
$('#flickable-element').flickable({segments:3});
```


## Documentation

### Event Callbacks

#### onCreate

Triggered when Flickable object is created.

``` js
$('#thing').flickable({onCreate: function(flickableObjects) { /* do stuff */ } });
```

#### onStart

Triggered when a touch event begins.

``` js
$('#thing').flickable({onStart: function(eventData) { /* do stuff */ } });
```

#### onMove

Triggered when the element is moved via a gesture in any direction.

``` js
$('#thing').flickable({onMove: function(eventData) { /* do stuff */ } });
```

#### onScroll

Triggered when element snaps to the nearest segment in any direction.

``` js
$('#thing').flickable({onScroll: function(eventData, segment) { /* do stuff */ } });
```

#### onScrollPrev

Triggered when element snaps to the previous segment.

``` js
$('#thing').flickable({onScrollPrev: function(eventData, segment) { /* do stuff */ } });
```

#### onScrollNext

Triggered when element snaps to the next segment.

``` js
$('#thing').flickable({onScrollNext: function(eventData, segment) { /* do stuff */ } });
```

#### onFlick

Triggered when element user flicks in a valid direction.

``` js
$('#thing').flickable({onFlick: function(eventData, segment) { /* do stuff */ } });
```

#### onFlickLeft

Triggered when element user flicks from right to left.

``` js
$('#thing').flickable({onFlickLeft: function(eventData, segment) { /* do stuff */ } });
```

#### onFlickRight

Triggered when element user flicks from left to right.

``` js
$('#thing').flickable({onFlickRight: function(eventData, segment) { /* do stuff */ } });
```

#### onFlickUp

Triggered when element user flicks from bottom to top.

``` js
$('#thing').flickable({onFlickUp: function(eventData, segment) { /* do stuff */ } });
```

#### onFlickDown

Triggered when element user flicks from up to down.

``` js
$('#thing').flickable({onFlickDown: function(eventData, segment) { /* do stuff */ } });
```

#### onEnd

Triggered when the user lifts their finger off the screen, ending the touch event.

``` js
$('#thing').flickable({onEnd: function(eventData, segment) { /* do stuff */ } });
```

### Event Data Object

Most events also include the event data object, which is structured like so:

``` js
eventData = {

   // Starting touchpoint [x pos, y pos, timestamp]
   start: {x:0, y:0, time: 0},

   delta: {

      // Previous touchpoint
      prevPos: {x:0, y:0},

      // Distance relative to original touchpoint
      dist: {x:0, y:0},

      // Direction of touch
      // [-1 left/up, +1 right/down, 0 no movement]
      dir: {x:0, y:0}

   },

   end: {

      // Duration of touch
      duration: 0,

      // Speed of movement along x and y axis
      speed: {x:0, y:0},

      // +1/-1 if the touch was deemed to
      // be a flick left/right up/down
      flick: {x:0, y:0}
   }

}
```

### Options

#### segments

Type: Number; Default: 5

Number of segments in which to divide the target element.

``` js
$('#thing').flickable({segments: 3});
```

#### flickThreshold

Type: Float; Default: 0.7

Threshold in which a simple "touch and move" gesture becomes a "flick".

If you're targeting Android, you may need to lower this to make it more sensitive because of Android's lower frame rates for translate3d animations. 

``` js
$('#thing').flickable({flickThreshold: 0.5});
```

#### flickDirection

Type: 'x' or 'y'; Default: 'auto'

Direction in which to divide the element into sections, and in which the user can flick.

If not specified, the direction will be automatically calculated based on which side of the target element is the longest.

``` js
$('#thing').flickable({flickDirection: 'x'});
```



#### snapSpeed

Type: Float; Default: 0.3

Speed in which the element will snap to the nearest segment when released (note this is separate from flickSnapSpeed). 

``` js
$('#thing').flickable({snapSpeed: 1});
```

#### flickSnapSpeed

Type: Float; Default: 0.3

Speed in which the element will snap to the nearest segment when flicked. 

``` js
$('#thing').flickable({flickSnapSpeed: 1});
```


#### preventDefault

Type: Boolean; Default: true

Whether or not to cancel default actions on the target element. Note that if this is set to false, the page will scroll with the gesture.

``` js
$('#thing').flickable({preventDefault: false});
```

### Methods

#### segment

Gets or sets the current segment. Note segments start at 0.

``` js
$('#thing').flickable('segment'); // gets current segment
$('#thing').flickable('segment', 5); // sets segment to 5
```

#### scrollNext

Scroll to next segment.

``` js
$('#thing').flickable('scrollNext');
```

#### scrollPrev

Scroll to previous segment.

``` js
$('#thing').flickable('scrollPrev');
```
