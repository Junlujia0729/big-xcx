// pages/mine/mine.js
const app = getApp();
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    classid: 0,
    items:[],
    datas:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({classid:options.id});
    userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/myclass", { id: options.id },function (res) {
        console.log(res.data);
        that.setData({
          items: res.data.data.playlist,
          datas: res.data.data.orderinfo
        });
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "课程列表" })
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
  copy:function(e){
    var  that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.qq,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            })  
          }
        })
      }
    })
  },
  logistics:function(e){
    wx.navigateTo({
      url: '../logistics/logistics?orderid=' + e.currentTarget.dataset.orderid,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  viewFile:function(e){
    wx.navigateTo({
      url: './viewfile?filename=' + encodeURIComponent(e.currentTarget.dataset.filename)
    })
  }
})