const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    columnid: 0,
    items:[]
  },
  onLoad(params) {
    const that = this; 
    var columnid = params.id;
    that.setData({
      columnid: columnid,
    });
    //老师简介
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_info", { column_id: columnid }, function (res) {
      that.setData({
        items: res.data.data
      });

    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (params) {
    
  },
  
  onReady: function () {
    wx.setNavigationBarTitle({ title: "老师简介" });

  },
  
})  
