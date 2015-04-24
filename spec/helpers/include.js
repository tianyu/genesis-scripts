var vm = require('vm');
var fs = require('fs');

include = function (file) {
	var code = fs.readFileSync(file, 'utf-8');
	vm.runInThisContext(code, {filename: file});
}

module.exports = {
	include: include
}
