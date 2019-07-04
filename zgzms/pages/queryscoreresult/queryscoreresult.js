// pages/queryscoreresult/queryscoreresult.js
const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url : '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    console.log(options);
    let url = app.globalData.mainQueryDomain + "ApiJiucuo/xcx_chafen_query?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk; 
    for (var i in options) {
      url += '&'+i + '=' + options[i] ;
    }
    that.setData({
      'url': encodeURI(url)
    });
    //上报formid
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: options.formid, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk}, function (res) {
      console.log('formID')
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
  onShareAppMessage: function (res) {

    return {
      title: '教师资格证成绩查询',
      path: '/pages/queryscore/queryscore',
      // imageUrl: 'http://www.52jiaoshi.com/download/52_green.jpg',
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat_uid", {
          scene: scene, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk
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
})