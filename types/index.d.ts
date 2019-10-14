declare enum Method {
    GET = "GET",
    POST = "POST"
}
interface IHeaders {
    [type: string]: string;
}
interface Option {
    method: Method;
    url: string;
    body: string;
    customFilename: string;
    headers: IHeaders;
}
/**
 * 下载文件
 * @param {*} method 方法 GET POST
 * @param {*} url 下载文件的地址
 * @param {*} body post请求需要的body
 * @param {*} customFilename 自定义的下载名字
 * @param {*} headers 自定义headers
 */
declare function download({ method, url, body, customFilename, headers, }: Option): Promise<unknown>;
export default download;
