const FileSaver = require('file-saver');
const mime = require('mime');

function getType(filename) {
  const fileNameArray = filename.split('.');
  if (fileNameArray.length <= 1) return false;
  return fileNameArray.pop();
}

function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * 下载文件
 * @param {*} method 方法 GET POST
 * @param {*} url 下载文件的地址
 * @param {*} body post请求需要的body
 * @param {*} customFilename 自定义的下载名字
 * @param {*} headers 自定义headers
 */
const download = ({method = 'GET', url, body, customFilename, headers = {'Content-type': 'application/json'}}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    console.log('[xhr]', xhr);
    xhr.open(method, url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.readyState !== 4 || this.status !== 200) {
        reject(new Error(`下载失败: readyState is ${this.readyState}, status is ${this.status}`));
        return;
      }
      let filename = '';
      const disposition = xhr.getResponseHeader('Content-Disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
      }
      const type = xhr.getResponseHeader('Content-Type');
      const blob = new Blob([this.response], {type});
      const extension = getType(filename) || mime.getExtension(type);
      /**
       * 1.有自定义名字，那么需要使用自定义名字 + 后缀
       * 2.无自定义名字，那么需要使用后端名字
       * 3.无自定义名字并且无后端名字，使用默认名字 + 后缀
       */
      let fullName = `下载文件.${extension}`;
      if (customFilename) {
        fullName = `${customFilename}.${extension}`;
      } else if (filename) {
        fullName = filename;
      }
      FileSaver.saveAs(blob, fullName);
      resolve();
    };
    xhr.onerror = reject;
    if (isObject(headers)) {
      Object.keys(headers).forEach((header) => xhr.setRequestHeader(header, headers[header]));
    }
    if (body) {
      xhr.send(body);
    } else {
      xhr.send();
    }
  });
};

export default download;
