		$(document).ready(function() 
		{
	
			if(!Modernizr.touch) {
				$('body').prepend('<div id="warning"><p>It looks like you\'re using a non-touch device. <br />This demo is much more impressive on a phone or tablet. I\'d recommend an iPad running iOS 5+ for best results.</p></div>');
			}
			
			
		});