const app = getApp();
const userApi = require('../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    page: 1,
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit_detail", {
        page:1
      }, function (res) {
        that.setData({
          datas: res.data.data
        })
        console.log(res.data.data)
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
   * 页面上拉触底事件
   */
  onReachBottom: function () {
    var tpg = that.data.page + 1;
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/profit_detail", {
        tpg: 1
      }, function (res) {
        that.setData({
          datas: res.data.data
        })
        console.log(res.data.data)
      });
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
}) 
