/*
---

script: Actions/Forecolor.js

description: Extends MooEditr to change the color of the text from a list a predefined colors.

license: MIT-style license

authors:
- Olivier Refalo

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.UI.ButtonOverlay
# - MooEditr.Actions

provides: [MooEditr.Actions.forecolor]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Forecolor.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.UI.ButtonOverlay.js"></script>
  <script src="MooEditr.Forecolor.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | forecolor | toggleview'
    });
  });
  </script>

...
*/

MooEditr.Actions.Settings.forecolor = {
	colors: [
		['000000', '993300', '333300', '003300', '003366', '000077', '333399', '333333'],
		['770000', 'ff6600', '777700', '007700', '007777', '0000ff', '666699', '777777'],
		['ff0000', 'ff9900', '99cc00', '339966', '33cccc', '3366f0', '770077', '999999'],
		['ff00ff', 'ffcc00', 'ffff00', '00ff00', '00ffff', '00ccff', '993366', 'cccccc'],
		['ff99cc', 'ffcc99', 'ffff99', 'ccffcc', 'ccffff', '99ccff', 'cc9977', 'ffffff']
	]
};

MooEditr.lang.set({
	changeColor: 'Change Color'
});

MooEditr.Actions.forecolor = {
	type: 'button-overlay',
	title: MooEditr.lang.get('changeColor'),
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var html = '';
			MooEditr.Actions.Settings.forecolor.colors.each(function(row){
				row.each(function(c){
					html += '<a href="#" class="forecolor-colorpicker-color" style="background-color: #' + c + '" title="#' + c.toUpperCase() + '"></a>'; 
				});
				html += '<span class="forecolor-colorpicker-br"></span>';
			});
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'a') return;
		var color = $(el).getStyle('background-color');
		this.execute('forecolor', false, color);
	}
};

