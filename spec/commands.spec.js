include('./initialize.js');

describe('Commands', function () {
  var movements = [
    'north', 'south', 'east', 'west',
    'northeast', 'northwest',
    'southeast', 'southwest',
  ];
  
  var descMovement = function (movement) {
    it('is a task that moves ' + movement, function () {
      var gwc = new MockGwc();
      var cmds = new Commands(gwc);
      cmds[movement]();
      expect(gwc.sent).toEqual([movement]);
    });
  };
  
  for (var i in movements) {
    var movement = movements[i];
    describe('.' + movement, descMovement.bind(this, movement));
  }

  describe('.kill(target)', function () {
    it('returns a task that attacks the target', function () {
        var gwc = new MockGwc();
        var cmds = new Commands(gwc);

        var task = cmds.kill("whatever");
        expect(gwc.sent).toEqual([]);
        task();
        expect(gwc.sent).toEqual(["kill whatever"]);
    });
  });
});
