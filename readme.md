# Flickable.js -- A Zepto Plugin to Enable Touch Gestures on Any HTML Element

Zepto is great for handling basic gesture events, but for more complex touch interactions it can be lacking. Flickable allows you to make any element touchable; useful for flicking between sections, or sliding elements around the page.

Primary target platforms are:

* iOS 5+
* Android 2.2+


# Detailed Info, Screenshots and Live Demos

I've written a post with a lot of info here: 
http://labs.kojo.com.au/flickable-zepto-plugin/


# Installation

Make sure you load flickable after Zepto

``` html
<script type="text/javascript" src="libs/zepto.min.js"></script>
<script type="text/javascript" src="plugins/zepto.flickable.js"></script>
```


# Usage

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

JavaScirpt: 

``` js
$('#flickable-element').flickable({segments:3});
```
