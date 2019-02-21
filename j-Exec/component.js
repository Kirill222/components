COMPONENT('exec', function(self, config) {
	self.readonly();
	self.blind();
	self.make = function() {

		var scope;

		var scopepath = function(el, val) {
			if (!scope)
				scope = el.scope();
			return scope ? scope.makepath ? scope.makepath(val) : val.replace(/\?/g, el.scope().path) : val;
		};

		self.event('click', config.selector || '.exec', function(e) {

			var el = $(this);
			var attr = el.attrd('exec');
			var path = el.attrd('path');
			var href = el.attrd('href');
			var def = el.attrd('def');
			var reset = el.attrd('reset');

			scope = null;

			if (el.attrd('prevent') === 'true') {
				e.preventDefault();
				e.stopPropagation();
			}

			if (attr) {
				if (attr.indexOf('?') !== -1)
					attr = scopepath(el, attr);
				EXEC(attr, el, e);
			}

			href && NAV.redirect(href);

			if (def) {
				if (def.indexOf('?') !== -1)
					def = scopepath(el, def);
				DEFAULT(def);
			}

			if (reset) {
				if (reset.indexOf('?') !== -1)
					reset = scopepath(el, reset);
				RESET(reset);
			}

			if (path) {
				var val = el.attrd('value');
				if (val) {
					if (path.indexOf('?') !== -1)
						path = scopepath(el, path);
					var v = GET(path);
					SET(path, new Function('value', 'return ' + val)(v), true);
				}
			}
		});
	};
});