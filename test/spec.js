var expect = require('expect.js');
var sinon = require('sinon');
var events = require('events');
var fix = require('./fixtures');
var unCache = function (req) {
	var resolved = require.resolve(req);
	delete require.cache[resolved];
}

describe('spec', function () {
	var chainer = require('../');
	var jobQueue;
	var getJob;
	var when;
	var Child
	var Parent
	var finish;
	beforeEach(function () {
		unCache('./Job');
		unCache('./customJobs');
		Job = require('./Job');
	 	Child = sinon.spy(require('./customJobs').Child);
	 	Parent = sinon.spy(require('./customJobs').Parent);
		jobQueue = new events.EventEmitter();
		finish = jobQueue.emit.bind(jobQueue, 'job complete', fix.completeJobId, fix.parentResult);
		sinon.spy(jobQueue, 'on');
		sinon.spy(Job, 'get');
		when = chainer(jobQueue, Job);
	});
	
	it('should expose a function after configuration', function () {
		expect(when).to.be.a(Function);
	});

	it('should expose then as a api', function () {
		expect(when(Parent).then).to.be.a(Function);
	});

	describe(':then', function () {
		it('should give error on invalid argument', function () {
			expect(when(Parent).then).to.throwError();
		});

		it('should listen to complete events', function () {
			when(Parent).then(Child);
			expect(jobQueue.on.callCount).to.eql(1);
		});

		describe('on parent job finished', function () {
			it('should create new child job', function () {
				when(Parent).then(Child);
				finish();
				expect(Job.get.callCount).to.eql(1);
				expect(Child.calledWithNew()).to.eql(true);
			});
			
			it('should let create several jobs', function () {
				var spy = sinon.spy(function (result, data, job, then) {
					expect(Job.get.callCount).to.eql(1);
					expect(result).to.eql(fix.parentResult);
					expect(data).to.eql(fix.parentData);
					expect(job).to.eql(fix.finishedJob);
					expect(then).to.be.a(Function);
					var child = new Child();
					sinon.spy(child, 'save');
					then(child);
					expect(child.save.callCount).to.eql(1);
				});
				when(Parent).then(spy);
				finish();
			});
		});
	});

});
