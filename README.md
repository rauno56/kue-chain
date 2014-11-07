kue-chain
=========

Using Kue I discovered that most of the new jobs in my system are created on reaction to some other jobs finish. After implementing a little helper function it got a little better, but it still left a lot of repetetive parts in the code which managed the sequencing of jobs. So I went a little further to make what's happening on what more clear. This is what came out.

Installation
============

`npm install kue-chain`

Usage
=====

First define your job types which inherit from Kue.Job:
```
var Job = require('kue').Job;
var util = require('util');

function TakeApart(thing) {
    Job.call(this, 'takeapart', {
        thing: thing
    });
}
util.inherits(TakeApart, Job);

function Repair(pieces, takeApartJobData) {
    Job.call(this, 'repair', {
        thing: takeApartJobData.thing,
        parts: pieces
    });
}
util.inherits(Repair, Job);

[...]
```

Start combining:

```
var kue = require('kue');
var jobs = kue.createQueue();
var when = require('kue-chain')(jobs, kue.Job);

when(TakeApart).then(Repair);
when(Repair).then(PutBackTogether);
```

Sometimes a little more control is needed:

```
/*
    ensure GoToStore and Buy are Kue Jobs...
 */
when(GoToStore).then(function (result, job.data, job, then) {
    checkTheShoppinglist(function (list) {
        // Buy each of the list items
        list.forEach(function (item) {
            then(new Buy(item));
        });
        // Always buy beer
        then(new Buy('beer'));
    });
});
```

And at other times you just need a shortcut to creat them:

```
var takeApartJob = new TakeApart('scooter');
takeApartJob.save();
```

Api
===

Module exports a function. The chainer:

##### `chainer(Kue.Queue queue, Kue.Job KueJob)` -> `Function when(string|Function ParentJob)`

This is needed for setup and setting up the job complete listener.

##### `when(string|Function ParentJob)` -> `Object thenable`

Function takes a parent job as well a string for the job type and returns a object with one property: `then`.

##### `Object thenable.then(Job|Function job)` -> `void`

Function  takes a child Job, which, as well as ParentJob, has to inherit from the Kues Job prototype, or a function `job(result, Object completedJobData, Job completedJob, Function then)`. `then` function here takes instance of a job and saves it.