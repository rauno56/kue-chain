var util = require('util');

function constructorOf(Child, Super) {
	if (Child === Super) return true;
	if (!Child) {
		return false;
	}
	if (Child.super_ === undefined) {
		return false;
	}
	if (Child.super_ === Super) {
		return true;
	} else {
		return constructorOf(Child.super_, Super);
	}
}

function constructorHandler(KueJob, Job, result, job) {
	return new Job(result, job.data, job).save();
}

function callbackHandler(KueJob, Job, result, job) {
	return Job(result, job.data, job, function (job) {
		if (job instanceof KueJob) {
			return job.save();
		}
		throw new Error(util.inspect(job) + ' is not instance of Kue job.');
	}); 
}

function then(jobs, KueJob, jobType, Job) {
	if ('function' !== typeof Job) {
		throw new Error('Then-call needs a job constructor of a function.');
	}
	var handler = constructorOf(Job, KueJob) ? constructorHandler : callbackHandler;
	jobs.on('job complete', function (id, result) {
		KueJob.get(id, function (err, job) {
			if (job.type === jobType) {
				return handler(KueJob, Job, result, job);
			}
		});
	});
}

module.exports = function chainer(jobs, KueJob) {
	return function (ParentJob) {
		var jobType;
		if ('string' === typeof ParentJob) {
			jobType = ParentJob;
		} else {
			if (!constructorOf(ParentJob, KueJob)) {
				throw new Error(ParentJob + ' does not inherit from the kue.Job.');
			}
			jobType = (new ParentJob).type;
		}
		if (!jobType) {
			throw new Error('Not an actionable parent job('+ParentJob+').');
		}
		return {
			then: then.bind(null, jobs, KueJob, jobType)
		};
	};
};
