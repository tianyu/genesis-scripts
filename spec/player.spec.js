include('./initialize.js');

describe('Player', function () {
  var move2str = function (move) {
    return {
      n: 'north',
      s: 'south',
      e: 'east',
      w: 'west',
      ne: 'northeast',
      nw: 'northwest',
      se: 'southeast',
      sw: 'southwest',
    }[move] || move;
  };

  it('has task-management functions: todo, resume and abort', function () {
    var I = new Player(new MockGwc());
    var invocs = [];

    I.todo(
      invocs.push.bind(invocs, 1),
      invocs.push.bind(invocs, 2),
      invocs.push.bind(invocs, 3)
    );
    expect(I.resume()).toBe(true);
    expect(I.resume()).toBe(true);
    I.abort();
    expect(I.resume()).toBe(false);
    expect(invocs).toEqual([1, 2]);
  });

  describe('.move', function () {
    var gwc = new MockGwc();
    var move = new Player(gwc).move;
    
    var descDirection = function (dir) {
      it('is a task that moves the player ' + move2str(dir), function () {
        move[dir]();
        expect(gwc.observe()).toEqual([move2str(dir)]);
      });
    };

    var dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    for (var i in dirs) {
      var dir = dirs[i];
      describe('.' + dir, descDirection.bind(this, dir));
    }
  });

  describe('.kill(target)', function () {
    it('returns a tasks that attacks the target', function () {
      var gwc = new MockGwc();

      var task = new Player(gwc).kill('whoever');
      expect(gwc.sent).toEqual([]);
      task();
      expect(gwc.sent).toEqual(['kill whoever']);
    });
  });

  describe('.moveAnd(task)', function () {
    var gwc = new MockGwc();
    var I = new Player(gwc);

    it('throws if task is not a function', function () {
      expect(I.moveAnd.bind(I, 'string')).toThrowError(TypeError);
      expect(I.moveAnd.bind(I, 23)).toThrowError(TypeError);
      expect(I.moveAnd.bind(I, {foo:'bar'})).toThrowError(TypeError);
    });
    
    var descDirection = function (dir) {
      it('is a task that moves the player ' + move2str(dir) + ' and performs the task', function () {
        greet[dir]();
        var expected = ['say hello'];
        if (dir != 'here') expected.unshift(move2str(dir));
        expect(gwc.observe()).toEqual(expected);
      });

      it('passes all arguments to the task', function () {
        var args = [];
        I.moveAnd(function () {
          for (var i in arguments) {
            args.push(arguments[i]);
          }
        })[dir]('some', 'arguments', 1, 2, 3);
        expect(gwc.observe()).toEqual([move2str(dir)]);
        expect(args).toEqual(['some', 'arguments', 1, 2, 3]);
      });
    };

    var greet = I.moveAnd(gwc.connection.send.bind(gwc.connection, 'say hello'));
    var dirs = ['here', 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    for (var i in dirs) {
      var dir = dirs[i];
      describe('.' + dir, descDirection.bind(this, dir));
    }
  });

  describe('.repeatedly(name, task)', function () {
    it('throws if task is not a function', function () {
      var gwc = new MockGwc();
      var I = new Player(gwc);

      expect(I.repeatedly.bind(I, 'name', 'string')).toThrowError(TypeError);
      expect(I.repeatedly.bind(I, 'name', 23)).toThrowError(TypeError);
      expect(I.repeatedly.bind(I, 'name', {foo:'bar'})).toThrowError(TypeError);
    });

    it('returns a task that repeats itself until it is stopped by passing "stop (name)"', function () {
      var gwc = new MockGwc();
      var I = new Player(gwc);

      I.todo(I.repeatedly('greeting', gwc.connection.send.bind(gwc.connection, 'say hi')));

      I.resume();
      I.resume();
      I.resume();
      I.resume('stop greeting');
      expect(gwc.observe()).toEqual(['say hi', 'say hi', 'say hi']);
    });

    it('resumes the next task when it is stopped without passing any arguments', function () {
      var gwc = new MockGwc();
      var I = new Player(gwc);

      I.todo(
        I.repeatedly('greeting', gwc.connection.send.bind(gwc.connection, 'say hi')),
        function () { expect(arguments.length).toBe(0); I.move.n(); }
      );

      expect(gwc.observe()).toEqual([]);
      I.resume('stop greeting');
      expect(gwc.observe()).toEqual(['north']);
    });
  });

});
