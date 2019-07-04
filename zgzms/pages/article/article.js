// pages/article/article.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleid:0,
    url:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    if (1 == 0 && wx.showShareMenu){
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    
    this.setData({
      articleid: params.id,
      url: app.globalData.mainDomain + "ApiNlpgbg/xcx_article_detail?id=" + params.id}
      );
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '我爱教师网双12全场九折最后一天',
      path: '/pages/article/article?id=' + that.data.articleid,
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
        //console.log(res1.shareTickets[0]);
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})