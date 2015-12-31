'use strict';

(function () {
  'use strict';

  function Smalltalk() {
    if (!(this instanceof Smalltalk)) {
      return new Smalltalk();
    }

    this.alert = function (title, message) {
      return new Promise(function (resolve) {
        alert(message);
        resolve();
      });
    };

    this.prompt = function (title, message, value, options) {
      return new Promise(function (resolve, reject) {
        var noCancel = options && !options.cancel;
        var result = prompt(message, value);

        if (result !== null) {
          resolve(result);
        } else if (!noCancel) {
          reject();
        }
      });
    };

    this.confirm = function (title, message, options) {
      var noCancel = options && !options.noCancel;
      return new Promise(function (resolve, reject) {
        var is = confirm(message);

        if (is) {
          resolve();
        } else if (!noCancel) {
          reject();
        }
      });
    };
  }

  module.exports = new Smalltalk();
})();