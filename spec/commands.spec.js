include('./initialize.js');

var MockGwc = function () {
  var invoked = [];

  this.invoked = invoked;
  this.connection = {
    send: function (command) {
      invoked.push(command);
    }
  };
};

describe('Commands', function () {
  var movements = [
    'north', 'south', 'east', 'west',
    'northeast', 'northwest',
    'southeast', 'southwest',
  ];
  for (i in movements) {
    var movement = movements[i];
    describe('.' + movement, function () {
      it('is a task that moves ' + movement, function () {
        var gwc = new MockGwc();
        var cmds = new Commands(gwc);
        cmds[movement]();
        expect(gwc.invoked).toEqual([movement]);
      });
    });
  }

  describe('.kill(target)', function () {
    it('returns a function that attacks the target', function () {
        var gwc = new MockGwc();
        var cmds = new Commands(gwc);

        var task = cmds.kill("whatever");
        expect(gwc.invoked).toEqual([]);
        task();
        expect(gwc.invoked).toEqual(["kill whatever"]);
    });
  });
});
