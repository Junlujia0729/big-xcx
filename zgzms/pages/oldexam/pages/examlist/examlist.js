const app = getApp();
const userApi = require('../../../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    
    const that = this;
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        userToken: app.globalData.userToken
      });
      userApi.requestAppApi_GET(app.globalData.mainDomain + "/Home/Practice/trueexam", { province:''}, function (res) {
        console.log(res.data.data);
        that.setData({
          datas: res.data.data
        });
      })
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
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        userToken: app.globalData.userToken
      });
      userApi.requestAppApi_GET(app.globalData.mainDomain + "/Home/Practice/trueexam", { province: '' }, function (res) {
        console.log(res.data.data);
        that.setData({
          datas: res.data.data
        });
      })
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})
