// pages/mine/mine.js
 
const app = getApp();
const userApi = require('../../../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    loadc:0,
    items:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/job_list", {classid:10571},function (res) {
          console.log(res.data)
          var datas = res.data.data;
          that.setData({
            items: datas,
          });
      });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "试讲" });
    
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
    const that = this
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/job_list", { classid: 10571 }, function (res) {
      console.log(res.data)
      var datas = res.data.data;
      for (var i = 0; i < datas.length; i++) {
        datas[i].deadline = datas[i].deadline.substr(0, 10);
      }
      that.setData({
        items: datas,
      });
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  //试讲
  chapt:function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var chaptertype = e.currentTarget.dataset.chaptertype;
    wx.navigateTo({
      url: '../lecturedetail/lecturedetail?id=' + id,
    })
  }
})

// 对比日期
function CompareDate(d1, d2) {
  return ((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))));
}
