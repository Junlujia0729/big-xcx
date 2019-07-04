// pages/mylogistic/mylogistic.js
const app = getApp();
const userApi = require('../../libraries/user.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    items:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Order/order", { page: 1, express_status:0}, function (res) {
        console.log(res.data.data);
        that.setData({
          items: res.data.data
        });
      })
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
    let that = this;
    let page = that.data.page + 1;
    userApi.requestAppApi_GET(app.globalData.mainDomain + "Order/order", { page: page, express_status: 0 }, function (res) {
      if (res.data.data.length){
        let items = that.data.items;
        for(let it of res.data.data){
          items.push(it);
        }
        that.setData({
          items: items,
          page: page
        });
      }
    })
  },
  selectAddress:function(e){
    wx.navigateTo({
      url: '../addresslist/addresslist?orderid=' + e.currentTarget.dataset.id,
    })
  }
})