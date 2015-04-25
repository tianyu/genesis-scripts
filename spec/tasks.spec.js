include('./initialize.js');

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
});
