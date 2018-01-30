COMPONENT('part', 'hide:true', function(self, config) {

	var init = false;

	self.readonly();
	self.setter = function(value) {

		if (config.if !== value) {
			config.hide && self.aclass('hidden');
			return;
		}

		config.hide && self.rclass('hidden');

		if (self.element.get(0).hasChildNodes()) {
			config.reload && EXEC(config.reload);
			config.default && DEFAULT(config.default, true);
		} else {
			SETTER('loading', 'show');
			setTimeout(function() {
				self.import(config.url, function() {
					if (!init) {
						config.init && EXEC(config.init);
						init = true;
					}
					config.reload && EXEC(config.reload);
					config.default && DEFAULT(config.default, true);
					SETTER('loading', 'hide', 500);
				});
			}, 200);
		}
	};
});