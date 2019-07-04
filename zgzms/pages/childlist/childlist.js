const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pid : 0,
    discountid : 0,
    detail:[],
    items: [],
    discount:false,
    tjuid:0,
    platform_ios:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    const that = this;
    that.setData({
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    })
    if (params.scene && params.scene != "") {
      let scene = decodeURIComponent(params.scene);
      that.setData({
        tjuid: scene,
      });
    }else{
      if (params.tjuid) {
        that.setData({
          tjuid: params.tjuid,
        })
      }
    }
    if (params.id){
      let pid = params.id;
      that.setData({
        pid: pid,
      });
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/childclasslist", { id: pid }, function (res) {
          
          that.setData({
            detail: res.data.data.classdetail,
            items: res.data.data.items
          });
          wx.setNavigationBarTitle({ title: res.data.data.classdetail.classname });
        })
      });
    }else{
      that.setData({
        discountid: params.discountid,
      });
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Discount/discountClass", { id: that.data.discountid }, function (res) {
          console.log(res.data);
          that.setData({
            items: res.data.data
          });
          if (res.data.data.length == 0){
            that.setData({
              discount: true
            });  
          }
          wx.setNavigationBarTitle({ title: '适用课程列表' });
        })
      });
    }
  },
  gotoClass: function (e) {
    const that = this;
    if (e.currentTarget.dataset.viewtype == 2) {
      wx.navigateTo({
        url: '../childlist/childlist?id=' + e.currentTarget.dataset.id + '&tjuid=' + that.data.tjuid,
      })
    } else {
      wx.navigateTo({
        url: '../classx/classx?id=' + e.currentTarget.dataset.id + '&tjuid=' + that.data.tjuid,
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
    const that = this;
    if (that.data.pid > 0){
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/childclasslist", { id: that.data.pid }, function (res) {
          that.setData({
            detail: res.data.data.detail,
            items: res.data.data.items
          });
        })
      });
    }else{
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Discount/discountClass", { id: that.data.discountid }, function (res) {
          that.setData({
            items: res.data.data
          });
        })
      });
    }
    
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
  
  }
})