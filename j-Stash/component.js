COMPONENT('stash', 'internal:false;class:hidden', function(self, config, cls) {

	var repo = document.createElement('DIV');
	var compiled = {};
	var loaded = {};
	var curr;

	self.readonly();

	self.make = function() {

		if (!config.internal) {
			$(repo).aclass(config.class).css({ left: '-1000px', top: '-1000px', position: 'absolute' });
			document.body.insertBefore(repo, document.body.children[0]);
		}

		self.aclass(cls);
	};

	self.clear = function(id) {

		if (id) {

			if (loaded[id]) {

				var refresh = false;

				if (curr && curr.getAttribute('data-id') === id) {
					self.dom.removeChild(curr);
					curr = null;
					refresh = true;
				}

				delete loaded[id];
				delete compiled[id];

				for (var i = 0; i < repo.children.length; i++) {
					var child = repo.children[i];
					if (child.getAttribute('data-id') === id) {
						repo.removeChild(child);
						break;
					}
				}

				FREE();

				refresh && setTimeout(function() {
					self.refresh();
				}, 500);
			}

			return;
		}

		loaded = {};
		compiled = {};

		while (repo.children.length)
			repo.removeChild(repo.children[0]);

		if (!config.internal)
			document.body.removeChild(repo);

		FREE();
	};

	self.destroy = function() {
		if (!config.internal)
			document.body.removeChild(repo);
		loaded = null;
		compiled = null;
	};

	self.add = self.register = function(id, body) {

		var div = document.createElement('DIV');
		div.setAttribute('data-id', id);
		div.setAttribute('class', cls + '-item');

		if (typeof(body) === 'string') {
			var el = $(body);
			for (var i = 0; i < el.length; i++)
				div.appendChild(el[i]);
		} else
			div.appendChild(body);

		repo.appendChild(div);
		self.refresh();
	};

	self.setter = function(value) {

		var children = repo.children;

		if (curr) {
			var currid = curr.getAttribute('data-id');
			if (value && currid === value)
				return;
			repo.appendChild(curr);
		}

		if (value) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];

				if (child.getAttribute('data-id') === value) {

					curr = child;
					self.dom.appendChild(child);

					if (!compiled[value]) {
						COMPILE();
						compiled[value] = 1;
					}

					return;
				}
			}

			// not found, tries to load
			if (!loaded[value]) {
				loaded[value] = 1;
				config.load && self.EXEC(config.load, value, function(response) {
					response && self.add(value, response);
				});
			}

		}
	};
});