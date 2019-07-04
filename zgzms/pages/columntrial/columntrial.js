// pages/columntrial/columntrial.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    column_id:0,
    column_info:[],
    items:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
      column_id: options.id
    });

    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/free_class", { column_id: that.data.column_id }, function (res) {
        that.setData({
          column_info: res.data.data,
          items: { price: res.data.data.price, title: res.data.data.column_title}
        });
        wx.setNavigationBarTitle({ title: res.data.data.column_title + "试听" });
      });
    });
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
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/free_class", { column_id: that.data.column_id }, function (res) {
      that.setData({
        items: res.data.data,
      });
    });
    wx.stopPullDownRefresh();
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
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.column_info.column_title,
      path: '/pages/columntrial/columntrial?id=' + that.data.column_id,
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat", {
          scene: scene, openid: app.globalData.openId
        }, function (shres) {

        });
        // 转发成功,通过res1.shareTickets[0]获取转发ticket
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
  //立即购买
  buy: function () {
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      return;
    }
    wx.navigateTo({
      url: '../columnorder/columnorder?id=' + that.data.column_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    });
  },
  selectclass:function(e){
    wx.navigateTo({
      url: '../sectiondetail/sectiondetail?id=' + e.currentTarget.dataset.id,
    })
  }
})