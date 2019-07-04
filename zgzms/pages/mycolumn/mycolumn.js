// pages/mycolumn/mycolumn.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items:[],
    inf_id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/buylist", { inf_id: that.data.inf_id}, function (res) {
        console.log(res.data.data);
        that.setData({
          items: res.data.data,
          inf_id: res.data.data.length
        });
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
    const that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/buylist", { inf_id: 0 }, function (res) {
      that.setData({
        items: res.data.data,
        inf_id: res.data.data.length
      });
    });
    wx.stopPullDownRefresh();
  },
  selectcolumn : function(e){
    const that = this;
    for (var i = 0; i < that.data.items.length;i++){
      if (e.currentTarget.dataset.id == that.data.items[i].id){
        if (that.data.items[i].is_dialy_class == 1) {
          wx.navigateTo({
            url: '../column/column?id=' + e.currentTarget.dataset.id,
          })
        } else {
          wx.navigateTo({
            url: '../columndetail/columndetail?id=' + e.currentTarget.dataset.id,
          })
        }
      }
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/buylist", { inf_id: that.data.inf_id }, function (res) {
        var items = that.data.items;
        for (var i = 0; i < res.data.data.length;i++){
          items.push(res.data.data[i]);
        }
        that.setData({
          items: items,
          inf_id: that.data.inf_id + res.data.data.length
        });
      });
    });
  }
})