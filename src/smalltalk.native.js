(function() {
  'use strict';

  function Smalltalk() {
    if (!(this instanceof Smalltalk)) {
      return new Smalltalk();
    }

    this.alert = (title, message) => {
      return new Promise(function(resolve) {
        alert(message);
        resolve();
      });
    };

    this.prompt = (title, message, value, options) => {
      return new Promise(function(resolve, reject) {
        let noCancel = options && !options.cancel;
        let result = prompt(message, value);

        if (result !== null) {
          resolve(result);
        } else if (!noCancel) {
          reject();
        }
      });
    };

    this.confirm = (title, message, options) => {
      let noCancel = options && !options.noCancel;
      return new Promise(function(resolve, reject) {
        let is = confirm(message);

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
