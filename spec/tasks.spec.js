describe('Tasks', function () {

  describe('.push()', function () {

    it('stores a var-arg of functions, resumed in order', function () {
      var tasks = new Tasks();
      var invoked = [];

      tasks.push(
        invoked.push.bind(invoked, 1),
        invoked.push.bind(invoked, 2),
        invoked.push.bind(invoked, 3)
      );

      expect(invoked).toEqual([]);
      tasks.resume();
      expect(invoked).toEqual([1]);
      tasks.resume();
      expect(invoked).toEqual([1, 2]);
      tasks.resume();
      expect(invoked).toEqual([1, 2, 3]);
    });

    it('throws on non-function elements', function () {
      var tasks = new Tasks();

      expect(tasks.push.bind(tasks, null)).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, 0)).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, '')).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, 5)).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, 'hello')).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, [1, 2, 3])).toThrowError(TypeError);
      expect(tasks.push.bind(tasks, {apply: 'apply'})).toThrowError(TypeError);
    });

    it('orders given tasks before existing tasks', function () {
      var tasks = new Tasks();
      var invocs = [];

      tasks.push(invocs.push.bind(invocs, 1));
      tasks.push(invocs.push.bind(invocs, 2));

      tasks.resume();
      tasks.resume();

      expect(invocs).toEqual([2, 1]);
    });

  });

  describe('.resume()', function () {

    it('invokes the next task and returns true', function () {
      var tasks = new Tasks();
      var invocs = [];

      tasks.push(
        invocs.push.bind(invocs, 1),
        invocs.push.bind(invocs, 2)
      );

      var result = tasks.resume();
      expect(invocs).toEqual([1]);
      expect(result).toBe(true);
    });

    it('returns false when there are no more tasks', function () {
      var tasks = new Tasks();
      
      var result = tasks.resume();
      expect(result).toBe(false);
    });

    it('can be passed hints, which are passed to the resumed task', function () {
      var tasks = new Tasks();
      var hints = [];

      tasks.push(function () {
        for (var i in arguments) { hints.push(arguments[i]); }
      });

      tasks.resume(["a", "b", "c"], 5, null, 7);

      expect(hints).toEqual([ ["a", "b", "c"], 5, null, 7 ]);
    });

  });

  describe('.clear()', function () {

    it('deletes all outstanding tasks', function () {
      var tasks = new Tasks();
      var badTask = function () { throw new Error("This task should not be invoked"); };

      tasks.push(badTask, badTask, badTask);
      tasks.clear();

      var result = tasks.resume();
      expect(result).toBe(false);
    });
  });
});
