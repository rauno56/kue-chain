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

function then(jobs, KueJob, jobType, Job) {
	jobs.on('job complete', function (id, result) {
		KueJob.get(id, function (err, job) {
			if (job.type === jobType) {
				if (constructorOf(Job, KueJob)) {
					new Job(result, job.data, job).save();
				} else {
					Job(result, job.data, job, function (job) {
						job.save();
					}); 
				}
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
