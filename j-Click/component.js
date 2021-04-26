COMPONENT('click', function(self, config) {

	self.readonly();

	self.click = function() {
		if (!config.disabled) {
			if (config.value)
				self.set(self.parser(config.value));
			else
				self.EXEC(self.path, self.element);
		}
	};

	self.make = function() {
		self.event('click', self.click);
		config.enter && $(config.enter === '?' ? self.scope : config.enter).on('keydown', 'input', function(e) {
			e.which === 13 && setTimeout(function() {
				!self.element[0].disabled && self.click();
			}, 100);
		});
	};
});