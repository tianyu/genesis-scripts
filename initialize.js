// This script should be run when the user logs in.
// E.g. Trigger on "Welcome to Genesis".

var Tasks = function () {
  var list = [];
  var isFunction = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  this.resume = function () {
    var fn = list.pop();
    if (!fn) return false;
    fn.apply(null, arguments);
    return true;
  };

  this.clear = function () {
    list = [];
  };

  this.push = function () {
    for (i = arguments.length-1; i >= 0; i--) {
      var task = arguments[i];
      if (!isFunction(task))
        throw new TypeError('Arguments must be functions');
      list.push(task);
    }
  };
};

var Commands = function (gwc) {
  var conn = gwc.connection;
  var send = conn.send;

  // Movement
  this.north = send.bind(conn, 'north');
  this.south = send.bind(conn, 'south');
  this.east =  send.bind(conn, 'east');
  this.west =  send.bind(conn, 'west');
  this.northeast = send.bind(conn, 'northeast');
  this.northwest = send.bind(conn, 'northwest');
  this.southeast = send.bind(conn, 'southeast');
  this.southwest = send.bind(conn, 'southwest');

  // Battle
  this.kill = function (target) { return send.bind(conn, 'kill ' + target); };
};

var Player = function (gwc) {
  var tasks = new Tasks();
  var cmds = new Commands(gwc);

  this.resume = tasks.resume.bind(tasks);
  this.abort = tasks.clear.bind(tasks);
  this.todo = tasks.push.bind(tasks);

  this.move = {
    n: cmds.north,
    s: cmds.south,
    e: cmds.east,
    w: cmds.west,
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

  this.kill = cmds.kill.bind(cmds);
  this.hunt = function (target) {
    return this.moveAnd(
      this.repeatedly("killing " + target, this.kill(target))
    );
  };
};

// Create the Player if we're running in the browser
if (!global) window.I = new Player(gwc);
