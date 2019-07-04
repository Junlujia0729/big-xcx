// pages/activity/activity.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },
  sharedata: {
    title: "我爱教师网"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.activityTitle != ''){
      wx.setNavigationBarTitle({ title: app.globalData.activityTitle })
    }else{
      wx.setNavigationBarTitle({ title: "活动详情" })
    }
    this.setData({ url: userApi.genWebPageUrl(app.globalData.activityUrl)});
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/share_template", {

    }, function (res) {
      if (res.data.code == 200) {
        that.sharedata = res.data.data;
      }
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
    return {
      title: that.sharedata.title,
      path: that.sharedata.path,
      imageUrl: that.sharedata.imageUrl,
      success: function (res1) {
        
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  }
})