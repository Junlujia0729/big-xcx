// created by gpake
const g_app = getApp();

(function() {

var config = {
    qiniuRegion: '',
    qiniuImageURLPrefix: 'http://imgs.52jiaoshi.com/',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: g_app.globalData.mainDomain + "Homework/upload_token",
    qiniuUploadTokenFunction: null
}

module.exports = {
    init: init,
    upload: upload,
}

// 在整个程序生命周期中，只需要 init 一次即可
// 如果需要变更参数，再调用 init 即可
function init(options) {
    updateConfigWithOptions(options);
}

function updateConfigWithOptions(options) {
    if (options.region) {
        config.qiniuRegion = options.region;
    } else {
        console.error('qiniu uploader need your bucket region');
    }
    if (options.uptoken) {
        config.qiniuUploadToken = options.uptoken;
    } else if (options.uptokenURL) {
        config.qiniuUploadTokenURL = options.uptokenURL;
    } else if(options.uptokenFunc) {
        config.qiniuUploadTokenFunction = options.uptokenFunc;
    }
    if (options.domain) {
        config.qiniuImageURLPrefix = options.domain;
    }
}

function upload(filePath, success, fail, options) {
    if (null == filePath) {
        console.error('qiniu uploader need filePath to upload');
        return;
    }
    if (options) {
        init(options);
    }
    if (config.qiniuUploadToken) {
        doUpload(filePath, success, fail, options);
    } else if (config.qiniuUploadTokenURL) {
        getQiniuToken(function() {
            doUpload(filePath, success, fail, options);
        });
    } else if (config.qiniuUploadTokenFunction) {
        config.qiniuUploadToken = config.qiniuUploadTokenFunction();
    } else {
        console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
        return;
    }
}

function doUpload(filePath, success, fail, options) {
    var url = uploadURLFromRegionCode(config.qiniuRegion);
    var fileName = filePath.split('/')[1];
    if (options && options.key) {
        fileName = options.key;
    }
    var formData = {
        'token': config.qiniuUploadToken,
        'key': fileName
    };
    var upload_task = wx.uploadFile({
        url: url,
        filePath: filePath,
        name: 'file',
        formData: formData,
        success: function (res) {
            var dataString = res.data
            var dataObject = JSON.parse(dataString);
            //do something
            var imageUrl = config.qiniuImageURLPrefix + dataObject.key;
            dataObject.imageURL = imageUrl;
            console.log(dataObject);
            if (success) {
                success(dataObject);
            }
        },
        fail: function (error) {
            console.log(error);
            if (fail) {
                fail(error);
            }
        }
    })
    upload_task.onProgressUpdate((res) => {
      // console.log('上传进度', res.progress)
      // console.log('已经上传的数据长度', res.totalBytesSent)
      // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
      //var upload_percent_str = 'upload_picture_list[' + proc + '].upload_percent';
      // _that.setData({
      //   [upload_percent_str]: res.progress
      // })
    })
}

function getQiniuToken(callback) {
  wx.request({
    url: config.qiniuUploadTokenURL,
    data: { miniprog: 1 },
    method: "GET",
    header: {
      'content-type': 'application/x-www-form-urlencode',
      'Authorization': g_app.globalData.userToken,
      'Version': '3.2.9',
      'From': 'android'
    },
    dataType: 'json',
    success: function (res) {
      var token = res.data.uptoken;
      config.qiniuUploadToken = token;
      if (callback) {
          callback();
      }
    },
    fail: function (error) {
      console.log(error);
    }
  })
}

function uploadURLFromRegionCode(code) {
    var uploadURL = null;
    // switch(code) {
    //     case 'ECN': uploadURL = 'https://up.qbox.me'; break;
    //     case 'NCN': uploadURL = 'https://up-z1.qbox.me'; break;
    //     case 'SCN': uploadURL = 'https://up-z2.qbox.me'; break;
    //     case 'NA': uploadURL = 'https://up-na0.qbox.me'; break;
    //     default: console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
    // }
    uploadURL = "https://up.qiniu.com";
    return uploadURL;
}

})();