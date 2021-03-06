/**
 * simulator specs
 */
var should = require('should'),
	fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	simulator = require('../lib/simulator'),
	xcode = require('../lib/xcode'),
	appPath;

describe('simulator', function(){

	function build(flags, done){
		if (typeof(flags)==='function') {
			done = flags;
			flags = [];
		}

		xcode.settings(function(err,settings){
			should(err).not.be.ok;

			var test_project = path.join(__dirname, 'Test'),
				cwd = process.cwd();

			process.chdir(test_project);
			try {
				var cmd = '/usr/bin/xcodebuild clean build -configuration Debug -sdk iphonesimulator'+settings.version+' GCC_PREPROCESSOR_DEFINITIONS="'+flags.join(' ')+'"';
				exec(cmd, function(err,stdout,stderr){
					should(stdout).match(/BUILD SUCCEEDED/);
					appPath = path.join(__dirname,'Test','build','Debug-iphonesimulator','Test.app');
					fs.existsSync(appPath).should.be.true;
					done(err);
				}); 
			}
			finally {
				process.chdir(cwd);
			}
		});
	}

	it('should be able to load ios-sim binary', function(done){
		this.timeout(10000);
		var sim = path.join(__dirname,'..','support','ios-sim');
		exec(sim+' --version',function(err,stdout,stderr){
			should(err).not.be.ok;
			should(stdout).be.ok;
			stdout.trim().should.equal('2.0');
			done();
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and log basic logs', function(done){
		this.timeout(30000);
		build(['LOG1=1'],function() {
			var logs = {};
			function logger(label, message) {
				logs[label] = message;
			}
			function callback(err) {
				should(err).not.be.ok;
				should(logs.debug).equal('debug test');
				should(logs.info).equal('info test');
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				auto_exit: true,
				hide: true
			};
			simulator.launch(obj);
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and log ti mocha results', function(done){
		this.timeout(30000);
		build(['LOG2=1'], function() {
			var logs = {};
			function logger(label, message) {
				logs[label] = message;
			}
			function callback(err, result) {
				should(err).not.be.ok;
				should(result).be.ok;
				result.should.be.an.object;
				result.should.have.property('foo','bar');
				Object.keys(logs).should.be.empty;
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				unit: true,
				hide: true
			};
			simulator.launch(obj);
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and log ti mocha results with multiple lines', function(done){
		this.timeout(30000);
		build(['LOG3=1'], function() {
			var logs = {};
			function logger(label, message) {
				logs[label] = message;
			}
			function callback(err, result) {
				should(err).not.be.ok;
				should(result).be.ok;
				result.should.be.an.object;
				result.should.have.property('foo','bar');
				Object.keys(logs).should.be.empty;
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				unit: true,
				hide: true
			};
			simulator.launch(obj);
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and timeout', function(done){
		this.timeout(30000);
		build(['LOG4=1'], function() {
			function logger(label, message) {
			}
			function callback(err, result) {
				should(err).be.ok;
				err.should.equal('launch timed out');
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				unit: true,
				hide: true,
				timeout: 3000
			};
			simulator.launch(obj);
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and detect crash with Objective-C exception', function(done){
		this.timeout(30000);
		build(['LOG5=1'], function() {
			function logger(label, message) {
			}
			function callback(err, result) {
				try {
					should(err).be.ok;
					err.should.equal('launch crashed');
					should(result).be.an.object;
					should(result.filename).be.a.string;
					should(result.textFilename).be.a.string;
					should(fs.existsSync(result.filename)).be.ok;
					should(fs.existsSync(result.textFilename)).be.ok;
					should(result.report).be.an.object;
					should(result.report.threads).be.an.array;
					should(result.report.crashing_thread_index).be.a.number;
					var threadInfo = result.report.threads[result.report.crashing_thread_index];
					should(threadInfo).be.an.object;
					should(threadInfo.thread_name).be.a.string;
					should(threadInfo.backtrace).be.an.array;
				}
				finally {
					if (result && result.filename && fs.existsSync(result.filename)) {
						fs.unlinkSync(result.filename);
					}
					if (result && result.textFilename && fs.existsSync(result.textFilename)) {
						fs.unlinkSync(result.textFilename);
					}
				}
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				unit: true,
				hide: true,
				timeout: 5000
			};
			simulator.launch(obj);
		});
	});

	(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and detect crash with C exception', function(done){
		this.timeout(30000);
		build(['LOG6=1'], function() {
			function logger(label, message) {
			}
			function callback(err, result) {
				try {
					should(err).be.ok;
					err.should.equal('launch crashed');
					should(result).be.an.object;
					should(result.filename).be.a.string;
					should(result.textFilename).be.a.string;
					should(fs.existsSync(result.filename)).be.ok;
					should(fs.existsSync(result.textFilename)).be.ok;
					should(result.report).be.an.object;
					should(result.report.threads).be.an.array;
					should(result.report.crashing_thread_index).be.a.number;
					var threadInfo = result.report.threads[result.report.crashing_thread_index];
					should(threadInfo).be.an.object;
					should(threadInfo.thread_name).be.a.string;
					should(threadInfo.backtrace).be.an.array;
				}
				finally {
					if (result && result.filename && fs.existsSync(result.filename)) {
						fs.unlinkSync(result.filename);
					}
					if (result && result.textFilename && fs.existsSync(result.textFilename)) {
						fs.unlinkSync(result.textFilename);
					}
				}
				done();
			}
			var obj = {
				logger: logger,
				build_dir: appPath,
				callback: callback,
				unit: true,
				hide: true,
				timeout: 5000
			};
			simulator.launch(obj);
		});
	});

	['SIGHUP','SIGKILL','SIGTERM','SIGINT'].forEach(function(signal){
		(process.env.TRAVIS ? it.skip : it)('should be able to launch simulator and survive a '+signal+' signal', function(done){
			this.timeout(60000);
			build(['LOG4=1'], function() {
				function logger(label, message) {
				}
				function callback(err, result, sig) {
					should(err).be.null;
					should(result).be.undefined;
					should(sig).be.equal(signal);
					done();
				}
				var obj = {
					logger: logger,
					build_dir: appPath,
					callback: callback,
					unit: true,
					hide: true,
					timeout: 25000
				};
				simulator.launch(obj);
				setTimeout(function(){
					// send the signal
					exec("ps -ef | grep ios-sim | grep -v grep | awk '{print $2}' | xargs kill -"+signal.replace(/^SIG/,''));
				},1000);
			});
		});
	});

});