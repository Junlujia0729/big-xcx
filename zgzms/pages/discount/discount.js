const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
  data: {
    /** 
        * 页面配置 
        */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
  },
  onLoad: function () {
    var that = this;

    /** 
     * 获取系统信息 
     */
    that.setData({
      winWidth: app.globalData.systemInfo.windowWidth,
      winHeight: app.globalData.systemInfo.windowHeight
    });

    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Discount/myDiscount", {}, function (res) {
        console.log(res.data);
          that.setData({
            discount: res.data.data
          });
      });
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Discount/myUsedDiscount", {}, function (res) {
        console.log(res.data);
        if (res.data.data) {
          that.setData({
            discountused: res.data.data
          });
        }
      })
    });


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "优惠券" });

  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
})  




