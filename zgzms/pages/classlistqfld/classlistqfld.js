const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
  data: {
    userInfo: [],
    items: []
  },
  onLoad(params) {
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        userInfo: {
          nickname: app.globalData.nickname,
          headimgurl: app.globalData.headimgurl,
        }
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_classlist_qfld", {}, function (res) {
        that.setData({
          items: res.data.data
        });
      })
    });
    if (params.title) {
      wx.setNavigationBarTitle({
        title: params.title,
      })
    }
  },
  // gotoClass: function (e) {
  //   if (e.currentTarget.dataset.viewtype == 2) {
  //     wx.navigateTo({
  //       url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
  //     })
  //   } else {
  //     wx.navigateTo({
  //       url: '../classx/classx?id=' + e.currentTarget.dataset.id,
  //     })
  //   }
  // },
  onReady() {

  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  }
})
