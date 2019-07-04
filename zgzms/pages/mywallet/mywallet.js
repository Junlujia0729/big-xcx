const app = getApp();
const userApi = require('../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    gohome: 0
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    var pages = getCurrentPages().length;
    if (pages < 2){
      that.setData({
        gohome: 1
      })
    }
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit", {}, function (res) {
        console.log(res.data.data);
        that.setData({
          datas:res.data.data
        })
      });
    });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit", {}, function (res) {
        that.setData({
          datas: res.data.data
        })
      });
    });
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
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit", {}, function (res) {
        console.log(res.data.data);
        that.setData({
          datas: res.data.data
        })
      });
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
  cheak:function(e){
    wx.navigateTo({
      url: '../mywalletdetail/mywalletdetail',
    })
  },
  cash: function (e) {
    const that = this;
    if (parseInt(that.data.datas.can_extract) < 2){
      wx.showModal({
        title: '提示',
        content: '暂不可提现，可提现金额小于最低提现金额2元',
        showCancel: false
      }) 
      return;
    }
    wx.navigateTo({
      url: '../cash/cash',
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
  },
}) 
