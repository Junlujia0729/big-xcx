const app = getApp()

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    items:[]
  },
  onLoad(params) {
    const that = this;
    wx.request({
      url: app.globalData.mainDomain + "ApiNlpgbg/xcx_class_list",
      data: Object.assign({}, params),
      header: { 'content-type': 'application/json' },
      dataType: 'json',
      success: function (res) {
        that.setData({
          items: res.data.data,
        });
      },
      fail: function (res) {

      }
    })
  },
})
