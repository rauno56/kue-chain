var Job = require('./Job');
var util = require('util');
var fixtures = require('./fixtures');

function Parent(input) {
	Job.call(this, fixtures.parentType, {
		input: input
	});
}
util.inherits(Parent, Job);

function Child(input) {
	Job.call(this, fixtures.childType, {
		input: input
	});
}
util.inherits(Child, Job);

module.exports = {
	Child: Child,
	Parent: Parent
};
