const app = getApp()
const userApi = require('../../libraries/user.js')

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    items:[]
  },
  onLoad(params) {
    const that = this;
   
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/recommend_column", {}, function (res) {
        that.setData({
          items: res.data.data,
        });
      });  
    });
  },
  onPullDownRefresh: function () {
    const that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/recommend_column", {}, function (res) {
      that.setData({
        items: res.data.data,
      });
    }); 
    wx.stopPullDownRefresh();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  selectcolumn: function(e){
    wx.navigateTo({
      url: '../column/column?id=' + e.currentTarget.dataset.id,
    })
  },

   /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '我爱教师网师说专栏',
      path: '/pages/columnlist/columnlist',
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
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
})  
