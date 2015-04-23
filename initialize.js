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
      if (stopHint === hint) {
        this.resume.apply(this, arguments);
      } else {
        this.pushOne(repeatingTask);
        task.apply(null, arguments);
      }
    };
    this.pushOne(repeatingTask);
  };
};

var Commands = function (gwc) {
  var send = gwc.connection.send;

  // Movement
  this.north = function () { send('north'); };
  this.south = function () { send('south'); };
  this.east =  function () { send('east'); };
  this.west =  function () { send('west'); };
  this.northeast = function () { send('northeast'); };
  this.northwest = function () { send('northwest'); };
  this.southeast = function () { send('southeast'); };
  this.southwest = function () { send('southwest'); };

  // Battle
  this.kill = function (target) {
    return function () { send('kill ' + target); };
  };
};

var Player = function (gwc) {
  var tasks = new Tasks();
  var cmds = new Commands(gwc);

  this.resume = tasks.resume;
  this.abort = tasks.clear;
  this.todo = tasks.push;
  this.repeatedly = tasks.repeat;

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
      return function () { movement(); action(); };
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
