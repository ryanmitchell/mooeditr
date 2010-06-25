/*
---

script: MooEditr.Pagebreak.js

description: Extends MooEditr with pagebreak plugin

license: MIT-style license

authors:
- Ryan Mitchell

requires:
# - MooEditr
# - MooEditr.UI
# - MooEditr.Actions

provides: [MooEditr.Actions.pagebreak]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditr.css">
  <link rel="stylesheet" href="MooEditr.Pagebreak.css">
  <script src="mootools.js"></script>
  <script src="MooEditr.js"></script>
  <script src="MooEditr.Pagebreak.js"></script>

  <script>
  window.addEvent('domready', function(){
    var MooEditr = $('textarea-1').MooEditr({
      actions: 'bold italic underline strikethrough | pagebreak | toggleview',
      externalCSS: '../../Assets/MooEditr/Editable.css'
    });
  });
  </script>

...
*/

MooEditr.Actions.Settings.pagebreak = {
	imageFile: '../../Assets/MooEditr/Other/pagebreak.gif'
};

MooEditr.lang.set({
	pageBreak: 'Page break'
});

MooEditr.Actions.extend({
	
	pagebreak: {
		title: MooEditr.lang.get('pageBreak'),
		command: function(){
			this.selection.insertContent('<img class="MooEditr-visual-aid MooEditr-pagebreak">');
		},
		events: {
			beforeToggleView: function(){ // code to run when switching from iframe to textarea
				if (this.mode == 'iframe'){
					var s = this.getContent().replace(/<img([^>]*)class="MooEditr-visual-aid MooEditr-pagebreak"([^>]*)>/gi, '<!-- page break -->');
					this.setContent(s);
				} else {
					var s = this.textarea.get('value').replace(/<!-- page break -->/gi, '<img class="MooEditr-visual-aid MooEditr-pagebreak">');
					this.textarea.set('value', s);
				}
			},
			render: function(){
				this.options.extraCSS = 'img.MooEditr-pagebreak { display:block; width:100%; height:16px; background: url('
					+ MooEditr.Actions.Settings.pagebreak.imageFile + ') repeat-x; }'
					+ this.options.extraCSS;
			}
		}
	}
		
});
