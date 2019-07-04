const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: [],
    items: [],
    platform_ios:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    });
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        userInfo: {
          nickname: app.globalData.nickname,
          headimgurl: app.globalData.headimgurl,
        }
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_zpclasslist", {}, function (res) {
        that.setData({
          items: res.data.data
        });
      })
    });
  },
  gotoClass: function (e) {
    if (e.currentTarget.dataset.viewtype == 2) {
      wx.navigateTo({
        url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
      })
    } else {
      wx.navigateTo({
        url: '../classx/classx?id=' + e.currentTarget.dataset.id,
      })
    }
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
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_zpclasslist", {}, function (res) {
      that.setData({
        items: res.data.data
      });
    });
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
    return {
      title: '我爱教师网教师资格证精品课程',
      path: '/pages/zpclasslist/zpclasslist',
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
  }
})