const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
  data: {
    userInfo: [],
    gohome: 0
  },
  onLoad(params) {
    var that=this;
    that.setData({
      userInfo: {
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl,
      }
    });
    var pages = getCurrentPages().length;
    if (pages < 2) {
      that.setData({
        gohome: 1
      })
    }
  },
  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const that = this
    
    wx.stopPullDownRefresh();
  },

  onShow: function () {
    const that = this
    
  },

  // 一键复制
  copy: function (e) {
    var that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            setTimeout(function () {
              that.setData({
                dialog: false
              })
            }, 1000)
          }
        })
      }
    })
  },

  //回到首页
  retuen: function () {
    wx.switchTab({
      url: '../home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})





