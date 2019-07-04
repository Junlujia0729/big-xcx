const app = getApp();
const userApi = require('../../../../libraries/user.js');
const qiniuUploader = require('../../../../utils/qiniuUploader.js');

Page({
  data: {
    images:[],
    images_count:0,
    upload_picture_list:[],
    upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=',
    show:1,
    uptoken: ''
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    if (params.jobid) {
      var jobid = params.jobid;
      that.setData({
        jobid: jobid
      })
    }

    userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", {}, function (res) {
      console.log(res);
      that.setData({
        uptoken: res.data.data.uptoken
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

   /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
     
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
  choose:function(e){
    const that = this;
    var images = that.data.images;
    var images_count = that.data.images_count;
    wx.chooseImage({
      count: 6 - that.data.images_count, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res)
        // if (that.data.images && that.data.images.length > 0){
        //   var _images = that.data.images;
        //   _images.push.apply(_images, res.tempFilePaths);
        //   that.setData({
        //     images: _images
        //   })
        // }else{
        //   that.setData({
        //     images: res.tempFilePaths
        //   })
        // }
        var tempFiles = res.tempFiles;
        for (var i in tempFiles) {
          images.push(tempFiles[i].path);
          images_count++;
        }
        that.setData({
          images: images,
          images_count: images_count
        });
        if (that.data.images.length >= 6){
          that.setData({
            show: '0'
          })
        }
      }
    })
  },
  
  // 预览图片
  previewImage: function (e) {
    const that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.images // 需要预览的图片http链接列表  
    })
  },

  // 提交图片
  submitimages:function(e){
    const that =this;
    const jobid = that.data.jobid;
    userApi.xcx_login_new(1, 0, function () {
      if (that.data.images.length > 0){
        //上传图片
        var upload_picture_list_ = [];
        for (var ii = 0; ii < that.data.images.length; ii++) {
          upload_picture_list_.push({
            upload_percent: 0,
            path_server: '',
            path: that.data.images[ii]
          });
        }

        that.setData({
          upload_picture_list: upload_picture_list_
        });

        var proc = 0;
        var total = upload_picture_list_.length;
        wx.showLoading({
          title: '正在提交',
        })
        userApi.upload_file_server(that, app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=' + that.data.uptoken, that.data.upload_picture_list, proc, total, function () {
          wx.hideLoading();
          var strImgUrl = "";
          for (var i = 0; i < that.data.upload_picture_list.length; i++) {
            if (that.data.upload_picture_list[i].path_server != undefined && that.data.upload_picture_list[i].path_server != "") {
              strImgUrl += (that.data.upload_picture_list[i].path_server + ",");
            }
          }
          strImgUrl = strImgUrl.substring(0, strImgUrl.length - 1);  
          // 提交作业
          submitjob(jobid, strImgUrl);
        });
      }
    });
  },


}) 
function submitjob(jobid, result){
  userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/submit_job", { jobid: jobid, result: result }, function (res) {
    console.log(res.data);
    if (res.data.code == 200) {
      wx.showToast({
        title: '提交成功',
      })
      wx.navigateTo({
        url: '../lecturedetail/lecturedetail',
      })
    } else if (res.data.code == 201) {
      console.log(res.code);
      wx.showToast({
        title: res.data.data.msg,
      })
    }
  });
}