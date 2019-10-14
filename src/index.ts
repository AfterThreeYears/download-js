import fileSaver from 'file-saver';
import mime from 'mime';
import { isObject, isNull } from 'lodash';

function getType(filename: string) {
  const fileNameArray = filename.split('.');
  if (fileNameArray.length <= 1) return;
  return fileNameArray.pop();
}

const isProd = process.env.NODE_ENV === 'production';
const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;

enum Method {
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
    xhr.open(method, url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      let error: Error | null = null;
      const type = xhr.getResponseHeader('Content-Type');
      const disposition = xhr.getResponseHeader('Content-Disposition') || '';
      const matches = filenameRegex.exec(disposition);
      let filename = '';
      try {
        if (this.readyState !== 4 || this.status !== 200) {
          error = new Error(`readyState is ${this.readyState}, status is ${this.status}`);
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
        const blob = new Blob([this.response], { type: type as string });
        const extension = getType(filename) || mime.getExtension(type as string);
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
