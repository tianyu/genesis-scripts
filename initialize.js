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
};

var Commands = function (gwc) {
  var send = gwc.connection.send;
  var exec = function (cmd) {
    return function () { send(cmd); };
  };

  // Movement
  this.north = exec('north');
  this.south = exec('south');
  this.east =  exec('east');
  this.west =  exec('west');
  this.northeast = exec('northeast');
  this.northwest = exec('northwest');
  this.southeast = exec('southeast');
  this.southwest = exec('southwest');

  // Battle
  this.kill = function (target) { return exec('kill ' + target); };
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

  this.repeatedly = function (name, action) {
    var stop = 'stop ' + name;
    var repeatingAction = function (hint) {
      if (hint === stop) {
        // Don't execute the action
        this.resume(); // Continue to the next task without hints
      } else {
        this.todo([repeatingAction]); // Requeue this action
        action(); // Execute the action
      }
    };
    return repeatingAction;
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
    return this.moveAnd(
      this.repeatedly("killing " + target, this.kill(target))
    );
  };
};

window.me = new Player(gwc);
console.log('Initialized');
