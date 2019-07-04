// pages/paycolumnresult/paycolumnresult.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    columnid:0,
    items:[],
    platform_ios:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    var items = prevPage.data.items;
    console.log(items);
    const that = this;
    that.setData({
      columnid: options.id,
      items: items,
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
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
  
  }
})