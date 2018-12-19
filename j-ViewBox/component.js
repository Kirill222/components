COMPONENT('viewbox', 'margin:0;scroll:true', function(self, config) {

	var eld;

	self.readonly();

	self.init = function() {
		OP.on('resize', function() {
			SETTER('viewbox', 'resize');
		});
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'disabled':
				eld.tclass('hidden', !value);
				break;
			case 'scroll':
				self.tclass('ui-viewbox-scroll', !!value);
				break;
		}
	};

	self.make = function() {
		self.element.prepend('<div class="ui-viewbox-disabled hidden"></div>');
		eld = self.find('> .ui-viewbox-disabled').eq(0);
		self.aclass('ui-viewbox ui-viewbox-hidden');
		self.resize();
	};

	self.resize = function() {
		var el = config.selector ? self.element.closest(config.selector) : self.parent();
		var h = ((el.height() / 100) * config.height) - config.margin;
		eld.css({ height: h, width: self.element.width() });
		self.css('height', h);
		self.element.SETTER('*', 'resize');
		var cls = 'ui-viewbox-hidden';
		self.hclass(cls) && self.rclass(cls, 100);
	};
});