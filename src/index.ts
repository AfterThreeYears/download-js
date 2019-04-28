import fileSaver from '../11node_modules/@types/file-saver';
import mime from '../11node_modules/@types/mime';

function getType(filename: string) {
  const fileNameArray = filename.split('.');
  if (fileNameArray.length <= 1) return false;
  return fileNameArray.pop();
}

function isObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

const isProd = process.env.NODE_ENV === 'production';

export enum Method {
  GET = "GET",
  POST = "POST",
}

interface IHeaders {
  [type: string]: string
}

interface Option {
  method: Method
  url: string
  body: string
  customFilename: string
  headers: IHeaders
}

const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;

/**
 * 下载文件
 * @param {*} method 方法 GET POST
 * @param {*} url 下载文件的地址
 * @param {*} body post请求需要的body
 * @param {*} customFilename 自定义的下载名字
 * @param {*} headers 自定义headers
 */
function download({
  method = Method.GET,
  url,
  body,
  customFilename,
  headers = {'Content-type': 'application/json'},
}: Option) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    console.log('[xhr]', xhr);
    xhr.open(method, url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      try {
        if (this.readyState !== 4 || this.status !== 200) {
          throw new Error(`readyState is ${this.readyState}, status is ${this.status}`);
        }
        const type = xhr.getResponseHeader('Content-Type');
        if (!type) {
          throw new Error('Content-Type为空');
        }
        const disposition = xhr.getResponseHeader('Content-Disposition') || '';
        if (!disposition.includes('attachment')) {
          throw new Error('Content-Disposition有误');
        }
        const matches = filenameRegex.exec(disposition);
        let filename = '';
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
        const blob = new Blob([this.response], { type });
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
        fileSaver.saveAs(blob, fullName);
        resolve();
      } catch (error) {
        reject(new Error(`下载失败: ${isProd ? '请稍后再试' : error.message}`));
      }
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
