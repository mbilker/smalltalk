'use strict';

(function () {
  'use strict';

  function SmallTalk(callback) {
    if (!(this instanceof SmallTalk)) {
      return new SmallTalk(callback);
    }

    var remove = bind(removeEl, '.smalltalk');

    var BUTTON_OK = ['OK'];
    var BUTTON_OK_CANCEL = ['OK', 'Cancel'];

    this.alert = function (title, msg, options) {
      return showDialog(title, msg, '', BUTTON_OK, options);
    };

    this.prompt = function (title, msg, value, options) {
      var val = value || '';
      var valueStr = '<input type="text" value="' + val + '" data-name="js-input">';

      return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
    };

    this.passphrase = function (title, msg, value, options) {
      var val = value || '';
      var valueStr = '<input type="password" value="' + val + '" data-name="js-input">';

      return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
    };

    // TODO: currently only works using arrow keys. Needs looking into.
    this.dropdown = function (title, msg, value, options) {
      var val = value || {};
      var valueStr = '<select data-name="js-select">';

      for (var name in value) {
        valueStr += '<option value="' + name + '">' + value[name] + '</option>';
      }

      valueStr += '</select>';

      return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
    };

    this.confirm = function (title, msg, options) {
      return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
    };

    function getTemplate(title, msg, value, buttons) {
      if (!Array.isArray(buttons)) {
        throw Error('buttons should be array!');
      }

      return '<div class="page">\n        <div data-name="js-close" class="close-button"></div>\n        <header>' + title + '</header>\n        <div class="content-area">\n            ' + msg + '\n            ' + value + '\n        </div>\n        <div class="action-area">\n          <div class="button-strip"> ' + buttons.map(function (name, i) {
        return '<button class="btn" tabindex="' + i + '" data-name="js-' + name.toLowerCase() + '">' + name + '</button>';
      }).join('') + '\n          </div>\n        </div>\n      </div>';
    }

    function showDialog(title, msg, value, buttons, options) {
      var dialog = document.createElement('div');
      var closeButtons = ['cancel', 'close', 'ok'];

      var ok;
      var cancel;

      var promise = new Promise(function (resolve, reject) {
        var noCancel = options && !options.cancel;
        var empty = function empty() {};

        ok = resolve;
        cancel = reject;

        if (noCancel) {
          cancel = empty;
        }
      });

      var tmpl = getTemplate(title, msg, value, buttons);

      dialog.innerHTML = tmpl;
      dialog.className = 'smalltalk';

      document.getElementById('sheet-container').appendChild(dialog);

      find(dialog, ['ok', 'input', 'select']).forEach(function (el) {
        el.focus();
      });

      find(dialog, ['input']).forEach(function (el) {
        el.setSelectionRange(0, value.length);
      });

      addListeterAll('click', dialog, closeButtons, function (event) {
        closeDialog(event.target, dialog, ok, cancel);
      });

      ['click', 'contextmenu'].forEach(function (event) {
        dialog.addEventListener(event, function () {
          find(dialog, ['ok', 'input', 'select']).forEach(function (el) {
            el.focus();
          });
        });
      });

      dialog.addEventListener('keydown', keyDown(dialog, ok, cancel));

      return promise;
    }

    function keyDown(dialog, ok, cancel) {
      return function (event) {
        var KEY = {
          ENTER: 13,
          ESC: 27,
          TAB: 9,
          LEFT: 37,
          UP: 38,
          RIGHT: 39,
          DOWN: 40
        };

        var keyCode = event.keyCode;
        var el = event.target;

        var namesAll = ['ok', 'cancel', 'input', 'select'];
        var names = find(dialog, namesAll).map(function (el) {
          return getDataName(el);
        });

        switch (keyCode) {
          case KEY.ENTER:
            closeDialog(el, dialog, ok, cancel);
            event.preventDefault();
            break;
          case KEY.ESC:
            remove();
            cancel();
            break;
          case KEY.TAB:
            if (event.shiftKey) {
              tab(dialog, names);
            }

            tab(dialog, names);
            event.preventDefault();
            break;
          default:
            var is = ['left', 'right', 'up', 'down'].some(function (name) {
              return keyCode === KEY[name.toUpperCase()];
            });

            if (is) {
              changeButtonFocus(dialog, names);
            }

            break;
        }

        event.stopPropagation();
      };
    }

    function getDataName(el) {
      return el.getAttribute('data-name').replace('js-', '');
    }

    function changeButtonFocus(dialog, names) {
      var name = '';
      var active = document.activeElement;
      var activeName = getDataName(active);
      var isButton = /ok|cancel/.test(activeName);
      var count = names.length - 1;

      if (activeName !== 'input' && activeName !== 'select' && count && isButton) {
        if (activeName === 'cancel') {
          name = 'ok';
        } else {
          name = 'cancel';
        }

        find(dialog, [name]).forEach(function (el) {
          el.focus();
        });
      }
    }

    function tab(dialog, names) {
      var active = document.activeElement;
      var activeName = getDataName(active);

      var count = names.length - 1;
      var index = names.indexOf(activeName);

      if (index === count) {
        index = 0;
      } else if (index < count) {
        index++;
      }

      var name = names[index];

      find(dialog, [name]).forEach(function (el) {
        el.focus();
      });
    }

    function closeDialog(el, dialog, ok, cancel) {
      var name = el.getAttribute('data-name').replace('js-', '');

      if (/close|cancel/.test(name)) {
        cancel();
      } else {
        var value = find(dialog, ['input', 'select']).reduce(function (value, el) {
          return el.value;
        }, null);

        ok(value);
      }

      remove();
    }

    function find(element, names) {
      var elements = names.map(function (name) {
        return element.querySelector('[data-name="js-' + name + '"]');
      }).filter(function (el) {
        return el;
      });

      return elements;
    }

    function addListeterAll(event, parent, elements, fn) {
      find(parent, elements).forEach(function (el) {
        return el.addEventListener(event, fn);
      });
    }

    function removeEl(name) {
      var el = document.querySelector(name);

      el.parentElement.removeChild(el);
    }

    function bind(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return function () {
        return fn.apply(undefined, args);
      };
    }
  }

  module.exports = new SmallTalk();
})();