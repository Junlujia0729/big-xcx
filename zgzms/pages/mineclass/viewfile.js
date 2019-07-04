// pages/mineclass/viewfile.js
const app = getApp();
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    filename:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      filename: decodeURIComponent(options.filename)
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  viewFile: function(e){
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      wx.showLoading({
        title: '正在加载',
      })
      var uuu = app.globalData.mainDomain + 'Xcx/download_file?url=' + encodeURI(that.data.filename);
      var ftype = "pdf";
      wx.downloadFile({
        url: uuu,
        success: function (res) {
          var filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            fileType: ftype,
            success: function (res) {

            },
            fail: function (err) {
              wx.showModal({
                title: '提示',
                content: err.errMsg,
              })
            }
          })
        },
        complete: function (res) {
          wx.hideLoading();
        }
      })

    });
  }
})