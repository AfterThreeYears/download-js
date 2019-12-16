### example

```js
  download({
    url: 'www.examole.com/download',
    checkResponse: (resp) => resp.type === 'multipart/form-data',
  }).then(() => {
    message.success('导出成功');
  }).catch((error) => {
    if (Object.prototype.toString.call(error) === '[object Blob]') {
      const reader = new FileReader();
      reader.onload = e => {
        alert(JSON.parse(e.target.result).message);
      };
      reader.readAsText(error);
      return;
    }
    alert(error.message);
  });
```