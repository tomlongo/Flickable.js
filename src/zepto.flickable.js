/**
 * Flickable: a Zepto plugin for making elements flickable on a touch device
 * 2012, Tom Longo
 *
 * Licensed under the Whatever License. Use it for whatever you want!
 * 
 * @author thetomlongo@gmail.com
 * @version 1.0.4
 * 
 * @requires 
 * Zepto JavaScript Library
 */
(function( $ ){

	var eventData, 
	 	eventDataObject = {
	
			start:	{x:0, y:0, time: 0}, 		// Starting touchpoint [x pos, y pos, milliseconds]
			
			delta: 	{
					
						prevPos:  {x:0, y:0},	// Previous touchpoint
						dist: 	  {x:0, y:0}, 	// Distance relative to original touchpoint
						dir:	  {x:0, y:0} 	// Direction of touch [-1 left/up, +1 right/down, 0 no movement]
					
					}, 
					
			end: 	{ 
			
						duration: 0, 			// Duration of touch in milliseconds
						speed:	  {x:0, y:0},   // Speed of movement along x and y axis
						flick: 	  {x:0, y:0} 	// +1/-1 if the touch was deemed to be a flick left/right up/down
					
					}
	
		}, 
		browserSucks 		= false, 			// Does the browser support CSS3 transitions? (this is auto detcted upon initialisation)
		flickableObjects 	= 0, 	 			// Number of flickable objects that have been initialised
		flickThreshold 		= 0.7, 	 			// Threshold in which a "touch and move" becomes a "flick" (the higher the number, the faster the swipe)
		minTravelDistance	= 5, 				// This is the minimum distance in px the user's finger must travel for it to be considered a valid flick
		debug 				= false; 			// If true, a floating div will display event data on screen during touches


	var methods = {

	init : function( options ) {
	
		var settings = $.extend( {
		  enableDebugger: false, 
		  segments		: 5, 
		  snapSpeed		: 0.3, 
		  flickSnapSpeed: 0.3, 
		  flickThreshold: false, 
		  segmentPx		: 'auto',
		  flickDirection: 'auto',
		  preventDefault: true,
		  preventDefaultAxis: 'both',
		  onCreate		: false, 
		  onFlick		: false,  
		  onFlickLeft	: false,  
		  onFlickRight	: false,  
		  onFlickUp		: false,  
		  onFlickDown	: false,  
		  onScroll		: false,  
		  onScrollNext	: false,  
		  onScrollPrev	: false,  
		  onMove		: false,  
		  onStart		: false, 
		  onEnd			: false
		}, options);
	
			return this.each(function() {

				var el 			= $(this),
					isAlive 	= el.data('isAlive');

					if (!isAlive) { // Has the plugin already been initialised for this element?
				
						var segments 		= settings.segments, 
							flickDirection	= _getFlickDirection(el, settings.flickDirection);
				
						  el.data('isAlive', true)
						  .data('pos', 0)
						  .data('snapSpeed', parseFloat(settings.snapSpeed))
						  .data('flickSnapSpeed', parseFloat(settings.flickSnapSpeed))
						  .data('segment', 0)
						  .data('segments', segments)
						  .data('flickDirection', flickDirection)
						  .data('segmentPx', _getSegmentPx(el, settings.segmentPx))
						  .data('preventDefaultAxis', settings.preventDefaultAxis);

						$(el).bind({
						
							onStart: function() {
								$(this).flickable('start', settings.onStart);
							},
							
							onMove: function() {
								$(this).flickable('move', settings.onMove);
							},
							
							onEnd: function() {
								$(this).flickable('finished', settings.onEnd);
							},

							onScroll: function() {
								$(this).flickable('scrollToSegment', settings.onScroll);
							},

							onScrollPrev: function() {
								$(this).flickable('prevSegment', settings.onScrollPrev);
							},
							
							onScrollNext: function() {
								$(this).flickable('nextSegment', settings.onScrollNext);
							},
							
							onFlick: function() {
								$(this).flickable('flick', settings.onFlick);
							},
							
							onFlickLeft: function() {
								$(this).flickable('flickLeft', settings.onFlickLeft);
							},
							
							onFlickRight: function() {
								$(this).flickable('flickRight', settings.onFlickRight);
							},
							
							onFlickUp: function() {
								$(this).flickable('flickUp', settings.onFlickUp);
							},
							
							onFlickDown: function() {
								$(this).flickable('flickDown', settings.onFlickDown);
							},
							
							touchstart: function(e) {
								_resetEventData(e);
								$(this).trigger("onStart");
							},
							
							touchmove: function(e) {								
								_updateDelta(e);

								if (settings.preventDefault) {
									_handlePreventDefault.call(this, e);
								}

								$(this).trigger("onMove");
							},
							
							touchend: function(e) {
								_endTouch(e);	
								$(this).trigger("onEnd");
							}
						
						});

						
						if(!_browserSupports('transform')){
							// Browser does not support CSS3 transitions ಠ_ಠ
							browserSucks = true;
						}
						
						if(parseInt(settings.flickThreshold)) {
							flickThreshold = parseInt(settings.flickThreshold);
						}
						
						if(debug || settings.enableDebugger) {
							_makeDebugger();
						}

						el.flickable('create', settings.onCreate);
						
					}

		
			});
	
		}, 

		

	create : function (callback) {

		var el 			= $(this);
			eventData 	= eventDataObject;
			flickableObjects++;

		_logEvent("It's alive!");
		
			// If element doesn't have an id, give it one. 
			// Everyone should have an id :)
			if(!el.attr('id')) {
				el.attr('id', 'flickable'+flickableObjects);
			}
			
		el.flickable('scrollToSegment');
			
			if (typeof callback == 'function') { 
			callback.call(this, flickableObjects); 
			}

		}, 		
		
		
	start : function (callback) {

		_logEvent('Touch start');
		
		var el 			 = $(this),
			segment 	 = parseInt(el.data('segment')),
			segmentPx 	 = parseInt(el.data('segmentPx')),
			anchor 		 = -(segmentPx * segment);
			
			el.data('anchor', anchor);
			
			if (typeof callback == 'function') { 
			callback.call(this, eventData); 
			}

		}, 
		
		
	segment : function (seg) {

		var el 		= $(this), 
			segments= parseInt(el.data('segments')), 
			segment = parseInt(el.data('segment'));
			

			if (typeof seg != 'undefined') {
			
				if(seg >= segments) {
					seg = (segments-1);
				} else if(seg < 0) {
					seg = 0;
				}
				
				if(seg !== segment) {
					el.data('segment', seg).trigger('onScroll');
				} else {
					el.flickable('scrollToSegment');
				}

			} 
			
			return parseInt(el.data('segment'));
		
		}, 
		
		
	move : function (callback) {

		var el 		= $(this), pos, style, 
			d		= el.data('flickDirection'), 
			anchor 	= parseInt(el.data('anchor')), 
			pos		= anchor + eventData.delta.dist[d];
		
		
			if(browserSucks) { // Browser does not support CSS3, using left/top properties instead
			
				if(d == 'y') {
					el.css('top', pos);
				} else {
					el.css('left', pos);
				}
				
			
			} else {

				(d == 'y') ? style = '(0,'+pos+'px,0)' : style = '('+pos+'px,0,0)';
			
				// Zepto does not currently support setting translate3d via .css() so we have to do it manually
				if(typeof document.getElementById(el.attr('id')).style.webkitTransform != 'undefined') {
					document.getElementById(el.attr('id')).style.webkitTransform = 'translate3d'+style; 
				} else if (typeof document.getElementById(el.attr('id')).style.mozTransform != 'undefined') {
					document.getElementById(el.attr('id')).style.mozTransform = 'translate3d'+style; 
				} else {
					document.getElementById(el.attr('id')).style.transform = 'translate3d'+style; 
				}
			
			}
		
		$(this).data('pos', pos); 

			if (typeof callback == 'function') { 
			callback.call(this, eventData); 
			}

		}, 
		
		
	scrollNext : function () {

			$(this).trigger('onScrollNext');
			
		}, 
		
	scrollPrev : function () {

			$(this).trigger('onScrollPrev');
			
		}, 
		
		
	nextSegment : function (callback) {

		_logEvent('Next segment');

		var el 			 = $(this),
			segment 	 = parseInt(el.data('segment')) + 1;
			
		el.flickable('segment', segment);

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			} 

		}, 
		
		
	prevSegment : function (callback) {

		_logEvent('Previous segment');

		var el 			 = $(this),
			segment 	 = parseInt(el.data('segment')) - 1;
			
		el.flickable('segment', segment);

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
				

	flick : function (callback) {

		_logEvent('You flicked');

		var el 	= $(this);

		switch(eventData.end.flick.x)
		{
		
			case -1:
			el.trigger("onFlickLeft");
			break;
		  
			case 1:
			el.trigger("onFlickRight");
			break;
			
		}
		
		switch(eventData.end.flick.y)
		{
		
			case -1:
			el.trigger("onFlickUp");
			break;
		  
			case 1:
			el.trigger("onFlickDown");
			break;
			
		}

			if (typeof callback == 'function') { 
			callback.call(this, eventData); 
			}

		}, 
		
	flickLeft : function (callback) {

		_logEvent('Flicked left');

		var el 		= $(this), 
			segment = parseInt(el.data('segment'));
	
		el.trigger('onScrollNext');

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
		
		
	flickRight : function (callback) {

		_logEvent('Flicked right');
		
		var el = $(this), 
			segment = parseInt(el.data('segment'));
			
		el.trigger('onScrollPrev');

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
		
		
		
	flickUp : function (callback) {

		_logEvent('Flicked up');
		
		var el 		= $(this), 
			segment = parseInt(el.data('segment'));
			
		el.trigger('onScrollNext');

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
		
		
	flickDown : function (callback) {

		_logEvent('Flicked down');
		
		var el 		= $(this), 
			segment = parseInt(el.data('segment'));
			
		el.trigger('onScrollPrev');

			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
		
		
	scrollToSegment : function (callback) {

		var el 			  = $(this), style, 
			d 	 		  = el.data('flickDirection'), 
			snapSpeed	  = parseFloat(el.data('snapSpeed')), 
			flickSnapSpeed= parseFloat(el.data('flickSnapSpeed')), 
			segments 	  = parseInt(el.data('segments')), 
			segment 	  = parseInt(el.data('segment')), 
			segmentPx 	  = parseInt(el.data('segmentPx')), 
			pos 		  = -(segmentPx * segment),
			easing		  = 'ease-out';

		_logEvent('Sliding to segment '+segment);

			if(eventData.end.flick.x || eventData.end.flick.y) {
				snapSpeed = flickSnapSpeed;
				easing = 'cubic-bezier(0, .70, .35, 1)';
			}
			
			el.data('anchor', pos)
			  .data('pos', pos)
			  .data('segment', segment);
			  
			  if(browserSucks) { // Browser does not support CSS3, using left/top properties instead
			  	if(d == 'y') {
				  	el.anim({top: pos}, snapSpeed, easing);
				} else {
					el.anim({left: pos}, snapSpeed, easing);
				}
			  } else {
			  	(d == 'y') ? style = '0px, '+pos+'px, 0px' : style = pos+'px, 0px, 0px';
			  	el.anim({translate3d: style}, snapSpeed, easing);
			  }
			 
			  
			if (typeof callback == 'function') { 
			callback.call(this, eventData, segment); 
			}

		}, 
	
		
	finished : function (callback) {

		var el 			 	= $(this),
			d 	 		 	= el.data('flickDirection'), 
			segments 	 	= parseInt(el.data('segments')), 
			segment 	 	= parseInt(el.data('segment')), 
			segmentPx 	 	= parseInt(el.data('segmentPx')), 
			anchor 		 	= parseInt(el.data('anchor')), 
			pos 		 	= parseInt(el.data('pos'));


			var nearestSegment;
			// If pos is greater than 0, this means the user is trying to scroll past the far left edge
			(pos < 0) ? nearestSegment = Math.abs(Math.round(pos / segmentPx)) : nearestSegment = 0;

			_logEvent('Nearest segment is '+nearestSegment);

			if (typeof callback == 'function') { 
				callback.call(this, eventData, segment); 
			}


			if(segment == nearestSegment) { 

				if(eventData.end.flick[d]) {
					return el.trigger("onFlick");
				}
				
			}

			if(nearestSegment == (segment+1)) {
				el.trigger('onScrollNext');
			} else if(nearestSegment == (segment-1)) {
				el.trigger('onScrollPrev');
			} else {
				el.flickable('segment', nearestSegment);
			}
			
		}
		
	
	};


	$.fn.flickable = function( method ) {
	
		if ( methods[method] ) {
		  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist' );
		}
	
	};




	// Private Functions
	
	function _resetEventData(e) {


		var pageX, pageY;

		// Android and iOS structure event data differently
		(typeof e.touches[0].pageX != 'undefined') ? pageX=e.touches[0].pageX : pageX=e.pageX; 
		(typeof e.touches[0].pageY != 'undefined') ? pageY=e.touches[0].pageY : pageY=e.pageY;

		eventData 		= eventDataObject;
		eventData.start = {x:pageX, y:pageY, time: e.timeStamp};
		eventData.delta.prevPos = {x:pageX,  y:pageY};

		_updateDelta(e);

		if(debug){ _printEventData(); }
		

	}
	
	
	function _updateDelta(e) {
		
		var pageX, pageY;
		
		// Android and iOS structure event data differently
		(typeof e.touches[0].pageX != 'undefined') ? pageX=e.touches[0].pageX : pageX=e.pageX;
		(typeof e.touches[0].pageY != 'undefined') ? pageY=e.touches[0].pageY : pageY=e.pageY;
		
		var dirX, dirY,
			prevX 	= pageX, 
			prevY 	= pageY, 
			distX 	= pageX - eventData.start.x, 
			distY 	= pageY - eventData.start.y;


			if(pageX > eventData.delta.prevPos.x) {
				dirX = 1;
			} else if(pageX < eventData.delta.prevPos.x) {
				dirX = -1;
			} else {
				dirX = 0;
			}
			
			
			if(pageY > eventData.delta.prevPos.y) {
				dirY = 1;
			} else if(pageY < eventData.delta.prevPos.y) {
				dirY = -1;
			} else {
				dirY = 0;
			}
		
		eventData.delta.prevPos	= {x:prevX,  y:prevY};
		eventData.delta.dist 	= {x:distX,  y:distY};
		eventData.delta.dir		= {x:dirX,   y:dirY};

		if(debug){ _printEventData(); }

	}
	
	function _handlePreventDefault(e) {
		var el = $(this),
			preventDefaultAxis = el.data('preventDefaultAxis'),
			restrictXAxis = preventDefaultAxis === 'both' || preventDefaultAxis === 'x',
			restrictYAxis = preventDefaultAxis === 'both' || preventDefaultAxis === 'y',
			preventXScroll = restrictXAxis && Math.abs(eventData.delta.dist.y) >= minTravelDistance,
			preventYScroll = restrictYAxis && Math.abs(eventData.delta.dist.x) >= minTravelDistance;

		if ( preventXScroll || preventYScroll ) {
			e.preventDefault();
		}
	}
	
	function _endTouch(e) {

		var duration 	= (e.timeStamp - eventData.start.time), 
			speedX 		= Math.abs(Math.round( eventData.delta.dist.x / duration * 100)/100), 
			speedY 		= Math.abs(Math.round( eventData.delta.dist.y / duration * 100)/100), 
			dirX		= eventData.delta.dir.x,
			dirY		= eventData.delta.dir.y,
			flickX		= 0, 
			flickY		= 0;

			if((speedX > flickThreshold)) {
				(Math.abs(eventData.delta.dist.x) >= minTravelDistance) ? flickX = dirX : flickX = 0;
			} else if((speedY > flickThreshold)) {
				(Math.abs(eventData.delta.dist.y) >= minTravelDistance) ? flickY = dirY : flickY = 0;
			}

		eventData.end.duration	= duration;
		eventData.end.speed		= {x:speedX, y:speedY};
		eventData.end.flick		= {x:flickX, y:flickY};

		if(debug){ _logEvent('Touch end'); _printEventData(); }

	}
	
	
	function _getFlickDirection(el, flickDirection) {
	
		// Must be 'x' or 'y'
		if((flickDirection !== 'x') && (flickDirection !== 'y')) {
			// Automatically determine direction based on which axis is longest
			(el.height() > el.width()) ? flickDirection = 'y' : flickDirection = 'x';
		}
	
		return flickDirection;
	
	}
	
	function _getSegmentPx(el, segmentPx) {
		
		if(!parseInt(segmentPx)) {

			var segmentPx, 
				segments	   = el.data('segments'),
				flickDirection = _getFlickDirection(el, el.data('flickDirection'));
				
			(flickDirection == 'y') ? segmentPx = el.height() / segments : segmentPx = el.width() / segments;

		}
		
		return segmentPx;
	}




   function _browserSupports(prop) {
        var div = document.createElement('div'),
           vendors = 'Khtml Ms O Moz Webkit'.split(' '),
           len = vendors.length;
     
        return function(prop) {
           if ( prop in div.style ) return true;
     
           prop = prop.replace(/^[a-z]/, function(val) {
              return val.toUpperCase();
           });
     
           while(len--) {
              if ( vendors[len] + prop in div.style ) {
                 return true;
              } 
           }
           return false;
        }
     }
     
     


	//debug stuff
	function _makeDebugger() {
	
		if(!$('#flickableDebugger').length) {
			debug = true;
			eventData = eventDataObject;
			eventData.eventLog = [];
			
			var html = '<div id="flickableDebugger" style="position: fixed; bottom: 0; margin: 0 auto; padding: 10px; width: 100%; background: #000; color: #fff; font-family: courier, sans-serif;">Debugger</div>'
			$('body').append(html);
		}
	
	}
	
	function _logEvent(event) {
		if(debug) {
			console.log(event);
			eventData.eventLog.splice(0,0,event);
			_printEventData();
		}
	}
	
	function _printEventData() {

		var eventLog = ''; 

			for (var i = 0; i < 3; i++) {
				eventLog += eventData.eventLog[i]+' | ';
			}

		var text = '<pre> \
		last 3 events: '+eventLog+'<br /> \
		start: {x:'+eventData.start.x+', y:'+eventData.start.y+',time: '+eventData.start.time+'}<br /> \
			delta: {<br /> \
			prevPos: {'+eventData.delta.prevPos.x+', '+eventData.delta.prevPos.y+'}<br /> \
			dist: {'+eventData.delta.dist.x+', '+eventData.delta.dist.y+'}<br /> \
			dir: {'+eventData.delta.dir.x+', '+eventData.delta.dir.y+'}<br /> \
			}<br /> \
		end: {<br /> \
			speed: {'+eventData.end.speed.x+', '+eventData.end.speed.y+'}<br /> \
			flick: {'+eventData.end.flick.x+', '+eventData.end.flick.y+'}<br /> \
			duration: '+eventData.end.duration+'<br /> \
		} \
		</pre>';
			
		$('#flickableDebugger').html(text);

	}

})( Zepto );