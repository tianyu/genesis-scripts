// This script should be run when the user logs in.
// E.g. Trigger on 'Welcome to Genesis'.

var isFunction = function (obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

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
  var send = conn.send.bind(conn);

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
    n: cmds.north.bind(cmds),
    s: cmds.south.bind(cmds),
    e: cmds.east.bind(cmds),
    w: cmds.west.bind(cmds),
    ne: cmds.northeast.bind(cmds),
    nw: cmds.northwest.bind(cmds),
    se: cmds.southeast.bind(cmds),
    sw: cmds.southwest.bind(cmds)
  };

  this.repeatedly = function (name, action) {
    if (!isFunction(action)) throw new TypeError('Action is not a function');
    var stop = 'stop ' + name;
    var resume = this.resume.bind(this);
    var todo = this.todo.bind(this);
    var repeatingAction = function (hint) {
      if (hint === stop) {
        // Don't execute the action
        resume(); // Continue to the next task without hints
      } else {
        todo(repeatingAction); // Requeue this action
        action(); // Execute the action
      }
    }.bind(this);
    return repeatingAction;
  };

  this.moveAnd = function (action) {
    if (!isFunction(action)) throw new TypeError('Argument is not a function');
    var move = this.move;
    var executeAfter = function (movement) {
      return function () { movement(); action.apply(null, arguments); };
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
      this.repeatedly('hunting', this.kill(target))
    );
  };
};

// Create the Player if we're running in the browser
I = new Player(gwc);
