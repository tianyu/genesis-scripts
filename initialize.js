// This script should be run when the user logs in.
// E.g. Trigger on "Welcome to Genesis".

var Tasks = function () {
  var list = [];
  this.resume = function () {
    var fn = list.pop();
    if (!fn) return false;
    fn.apply(null, arguments);
    return true;
  };
  this.clear = function () {
    list = [];
  };
  this.pushOne = function (task) {
    if (!task) return;
    list.push(task);
  }
  this.push = function (tasks) {
    tasks = tasks || [];
    while (tasks.length > 0) {
      this.pushOne(tasks.pop());
    }
  };
  this.repeat = function (name, task) {
    var stopHint = name? "stop " + name : "stop";
    var repeatingTask = function (hint) {
      if (stopHint === hint) return this.resume.apply(this, arguments);
      this.pushOne(repeatingTask);
      return task.apply(null, arguments);
    };
    this.pushOne(repeatingTask);
  };
};

var Commands = function (gwc) {
  var send = function(cmd) {
    gwc.connection.send(cmd);
    return true;
  };

  // Movement
  this.north = function () { return send('north'); };
  this.south = function () { return send('south'); };
  this.east =  function () { return send('east'); };
  this.west =  function () { return send('west'); };
  this.northeast = function () { return send('northeast'); };
  this.northwest = function () { return send('northwest'); };
  this.southeast = function () { return send('southeast'); };
  this.southwest = function () { return send('southwest'); };

  // Battle
  this.kill = function (target) {
    return function () { return send('kill ' + target); };
  };
};

var Player = function (gwc) {
  var tasks = new Tasks();
  var cmds = new Commands(gwc);

  this.resume = tasks.resume;
  this.abort = tasks.clear;
  this.todo = tasks.push;

  this.move = {
    n: cmds.north,
    s: cmds.south,
    e:  cmds.east,
    w:  cmds.west,
    ne: cmds.northeast,
    nw: cmds.northwest,
    se: cmds.southeast,
    sw: cmds.southwest
  };

  this.moveAnd = function (action) {
    var move = this.move;
    var executeAfter = function (movement) {
      return function () { movement(); return action(); };
    };
    return {
      here: action,
      n: executeAfter(move.n),
      s: executeAfter(move.s),
      e: executeAfter(move.e),
      w: executeAfter(move.w),
      ne: executeAfter(move.ne),
      nw: executeAfter(move.nw),
      se: executeAfter(move.se),
      sw: executeAfter(move.sw)
    };
  };

  this.kill = cmds.kill;
  this.hunt = function (target) {
    return this.moveAnd(this.kill(target));
  };
};

window.me = new Player(gwc);
console.log('Initialized');
