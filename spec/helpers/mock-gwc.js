MockGwc = function () {
  var sent = [];
  var lastObserved = 0;
  
  this.sent = sent;
  this.observe = function () {
    var observed = sent.slice(lastObserved);
    lastObserved = sent.length;
    return observed;
  };
  
  this.connection = {
    send: function (cmd) {
      sent.push(cmd);
    }
  };
};