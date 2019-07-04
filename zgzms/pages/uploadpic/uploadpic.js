// pages/uploadpic/uploadpic.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uptoken:'',
    upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=',
    upload_picture_list: [],
    imageurls : [
      "http://imgs.52jiaoshi.com/1513567297.png",
      "http://imgs.52jiaoshi.com/banner.png",
      "http://7xodvc.com2.z0.glb.qiniucdn.com/web/52teacher-pc-banner-20170809.jpg"
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", {}, function (res) {
        console.log(res);
        that.setData({
          uptoken: res.data.data.uptoken,
          upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=' + res.data.data.uptoken
        });
      });
    });
  },

  uploadpic : function(e){
    var that = this
    var upload_picture_list = that.data.upload_picture_list
    wx.chooseImage({
      count: 3, // 默认9，这里显示一次选择相册的图片数量
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFiles = res.tempFiles
        //循环把图片加入上传列表
        for (var i in tempFiles) {
          tempFiles[i]['upload_percent'] = 0
          tempFiles[i]['path_server'] = ''
          upload_picture_list.push(tempFiles[i])
        }
        that.setData({
          upload_picture_list: upload_picture_list,
        })
        //循环把图片上传到服务器 并显示进度
        userApi.upload_file_server(that, that.data.upurl, upload_picture_list, 0, upload_picture_list.length,function(){
          
        });
      }
    })
  },

  clickImage: function (e) {
    var that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      urls: that.data.imageurls,//内部的地址为绝对路径
      fail: function () {
        console.log('fail')
      },
      complete: function () {
        console.info("点击图片了");
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})