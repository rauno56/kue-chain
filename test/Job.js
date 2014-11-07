var fixtures = require('./fixtures');

module.exports = Job;

/*
	Minimum mock of a Kue Job.
 */

function Job(type, data) {
	this.type = type;
	this.data = data || {};
}

Job.get = function (id, cb) {
	cb(null, fixtures.finishedJob);
};

Job.prototype = {
	save: function () {},
}

