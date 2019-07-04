const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    
  },
  onLoad(params) {
    const that = this; 
    that.setData({
      classid: params.id,
    });
    //老师简介
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/teacherlist", {
      classid: params.id,
    }, function (res) {
      that.setData({
        teacherlist: res.data.data
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
