import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.for-each";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.is-array";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.split";
import "core-js/modules/web.dom-collections.for-each";
import fileSaver from 'file-saver';
import mime from 'mime';
import { isObject, isNull } from 'lodash';

function getType(filename) {
  var fileNameArray = filename.split('.');
  if (fileNameArray.length <= 1) return;
  return fileNameArray.pop();
}

var isProd = process.env.NODE_ENV === 'production';
var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
var Method;

(function (Method) {
  Method["GET"] = "GET";
  Method["POST"] = "POST";
})(Method || (Method = {}));

/**
 * 下载文件
 * @param {*} method 方法 GET POST
 * @param {*} url 下载文件的地址
 * @param {*} body post请求需要的body
 * @param {*} customFilename 自定义的下载名字
 * @param {*} headers 自定义headers
 */
function download(_ref) {
  var _ref$method = _ref.method,
      method = _ref$method === void 0 ? Method.GET : _ref$method,
      url = _ref.url,
      body = _ref.body,
      customFilename = _ref.customFilename,
      _ref$headers = _ref.headers,
      headers = _ref$headers === void 0 ? {
    'Content-type': 'application/json'
  } : _ref$headers;
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      var error = null;
      var type = xhr.getResponseHeader('Content-Type');
      var disposition = xhr.getResponseHeader('Content-Disposition') || '';
      var matches = filenameRegex.exec(disposition);
      var filename = '';

      try {
        if (this.readyState !== 4 || this.status !== 200) {
          error = new Error("readyState is ".concat(this.readyState, ", status is ").concat(this.status));
        } else if (isNull(type)) {
          error = new Error('Content-Type为空');
        } else if (!disposition.includes('attachment')) {
          error = new Error('Content-Disposition有误');
        }

        if (error) {
          throw error;
        }

        if (Array.isArray(matches) && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }

        var blob = new Blob([this.response], {
          type: type
        });
        var extension = getType(filename) || mime.getExtension(type);
        /**
         * 1.有自定义名字，那么需要使用自定义名字 + 后缀
         * 2.无自定义名字，那么需要使用后端名字
         * 3.无自定义名字并且无后端名字，使用默认名字 + 后缀
         */

        var fullName = "\u4E0B\u8F7D\u6587\u4EF6.".concat(extension);

        if (customFilename) {
          fullName = "".concat(customFilename, ".").concat(extension);
        } else if (filename) {
          fullName = filename;
        }

        fileSaver.saveAs(blob, fullName);
        resolve();
      } catch (error) {
        reject(new Error("\u4E0B\u8F7D\u5931\u8D25: ".concat(isProd ? '请稍后再试' : error.message)));
      }
    };

    xhr.onerror = reject;

    if (isObject(headers)) {
      Object.keys(headers).forEach(function (header) {
        return xhr.setRequestHeader(header, headers[header]);
      });
    }

    if (body) {
      xhr.send(body);
    } else {
      xhr.send();
    }
  });
}

;
export default download;