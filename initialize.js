// This script should be run when the user logs in.
// E.g. Trigger on "Welcome to Genesis".

window.Tasks = function () {
  var list = [];
  this.resume = function () {
    var fn = list.pop();
    if (!fn) return false;
    fn();
    return true;
  };
  this.clear = function () {
    list = [];
  };
  this.push = function (tasks) {
    tasks = tasks || [];
    while (tasks.length > 0) {
      var fn = tasks.pop();
      if (!fn) continue;
      list.push(fn);
    }
  };
};

window.Commands = function (gwc) {
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
  this.kill = function (target) { return function () { send('kill ' + target); }; };
};

window.Player = function (gwc) {
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
  
  this.kill = cmds.kill;
  
  this.hunt = function (target) {
    var attack = this.kill(target);
    return {
      here: attack,
      n: function () { this.n(); attack(); },
      s: function () { this.s(); attack(); },
      e: function () { this.e(); attack(); },
      w: function () { this.w(); attack(); },
      ne: function () { this.ne(); attack(); },
      nw: function () { this.nw(); attack(); },
      se: function () { this.se(); attack(); },
      sw: function () { this.sw(); attack(); }
    };
  }.bind(this);
};

window.me = new Player(gwc);
console.log('Initialized');
