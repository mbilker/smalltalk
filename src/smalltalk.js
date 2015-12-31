(function() {
  'use strict';

  function SmallTalk(callback) {
    if (!(this instanceof SmallTalk)) {
        return new SmallTalk(callback);
    }

    let remove = bind(removeEl, '.smalltalk');

    const BUTTON_OK = ['OK'];
    const BUTTON_OK_CANCEL = ['OK', 'Cancel'];

    this.alert = (title, msg, options) => {
      return showDialog(title, msg, '', BUTTON_OK, options);
    };

    this.prompt = (title, msg, value, options) => {
      let val = value || '';
      let valueStr = `<input type="text" value="${val}" data-name="js-input">`;

      return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
    };

    this.passphrase = (title, msg, value, options) => {
      let val = value || '';
      let valueStr = `<input type="password" value="${val}" data-name="js-input">`;

      return showDialog(title, msg, valueStr, BUTTON_OK_CANCEL, options);
    };

    this.confirm = (title, msg, options) => {
      return showDialog(title, msg, '', BUTTON_OK_CANCEL, options);
    };

    function getTemplate(title, msg, value, buttons) {
      if (!Array.isArray(buttons)) {
        throw Error('buttons should be array!');
      }

      return `<div class="page">
        <div data-name="js-close" class="close-button"></div>
        <header>${title}</header>
        <div class="content-area">
            ${msg}
            ${value}
        </div>
        <div class="action-area">
          <div class="button-strip"> ${
            buttons.map((name, i) =>
              `<button class="btn" tabindex="${i}" data-name="js-${name.toLowerCase()}">${name}</button>`
            ).join('')
          }
          </div>
        </div>
      </div>`;
    }

    function showDialog(title, msg, value, buttons, options) {
      let dialog  = document.createElement('div');
      let closeButtons = [
        'cancel',
        'close',
        'ok'
      ];

      var ok;
      var cancel;

      let promise = new Promise((resolve, reject) => {
        let noCancel = options && !options.cancel;
        let empty = () => {};

        ok = resolve;
        cancel = reject;

        if (noCancel) {
          cancel = empty;
        }
      });

      let tmpl = getTemplate(title, msg, value, buttons);

      dialog.innerHTML = tmpl;
      dialog.className = 'smalltalk';

      document.getElementById('sheet-container').appendChild(dialog);

      find(dialog, ['ok', 'input']).forEach(el => {
        el.focus();
      });

      find(dialog, ['input']).forEach(el => {
        el.setSelectionRange(0, value.length);
      });

      addListeterAll('click', dialog, closeButtons, (event) => {
        closeDialog(event.target, dialog, ok, cancel);
      });

      ['click', 'contextmenu'].forEach((event) => {
        dialog.addEventListener(event, () => {
          find(dialog, ['ok', 'input']).forEach((el) => {
            el.focus();
          });
        });
      });

      dialog.addEventListener('keydown', keyDown(dialog, ok, cancel));

      return promise;
    }

    function keyDown(dialog, ok, cancel) {
      return (event) => {
        const KEY = {
          ENTER : 13,
          ESC   : 27,
          TAB   : 9,
          LEFT  : 37,
          UP    : 38,
          RIGHT : 39,
          DOWN  : 40
        };

        let keyCode = event.keyCode;
        let el = event.target;

        let namesAll = ['ok', 'cancel', 'input'];
        let names = find(dialog, namesAll).map((el) => {
          return getDataName(el);
        });

        switch(keyCode) {
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
            let is = ['left', 'right', 'up', 'down'].some((name) => {
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
      let active = document.activeElement;
      let activeName = getDataName(active);
      let isButton = /ok|cancel/.test(activeName);
      let count = names.length - 1;

      if (activeName !== 'input' && count && isButton) {
        if (activeName === 'cancel') {
          name = 'ok';
        } else {
          name = 'cancel';
        }

        find(dialog, [name]).forEach((el) => {
          el.focus();
        });
      }
    }

    function tab(dialog, names) {
      let active = document.activeElement;
      let activeName = getDataName(active);

      let count = names.length - 1;
      let index = names.indexOf(activeName);

      if (index === count) {
        index = 0;
      } else if (index < count) {
        index++;
      }

      let name = names[index];

      find(dialog, [name]).forEach(el => {
        el.focus();
      });
    }

    function closeDialog(el, dialog, ok, cancel) {
      let name = el.getAttribute('data-name').replace('js-', '');

      if (/close|cancel/.test(name)) {
        cancel();
      } else {
        let value = find(dialog, ['input']).reduce((value, el) => {
          return el.value;
        }, null);

        ok(value);
      }

      remove();
    }

    function find(element, names) {
      let elements = names.map((name) => {
        return element.querySelector(`[data-name="js-${name}"]`);
      }).filter((el) => {
        return el;
      });

      return elements;
    }

    function addListeterAll(event, parent, elements, fn) {
      find(parent, elements).forEach((el) => {
        return el.addEventListener(event, fn);
      });
    }

    function removeEl(name) {
      let el = document.querySelector(name);

      el.parentElement.removeChild(el);
    }

    function bind(fn, ...args) {
      return () => fn(...args);
    }
  }

  module.exports = new SmallTalk();
})();
