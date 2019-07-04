const app = getApp();
const userApi = require('../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    selecttime: 2,
    timeArray:[
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ],
    mobile:'未设置'
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    if (app.globalData.mobile) {
      that.setData({
        mobile: app.globalData.mobile
      });
    }
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        userToken: app.globalData.userToken
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/user/getDKsetting", {}, function (res) {
        console.log(res.data.data);
        if (res.data.data.dk_shutdown == 0){
          that.setData({
            flag: true,
            time: res.data.data.dk_time
          });
        }else{
          that.setData({
            flag: false,
            time: res.data.data.dk_time
          });  
        }
        if (res.data.data.dk_notifydown == 0) {
          that.setData({
            con_flag: true,
          });
        } else {
          that.setData({
            con_flag: false,
          });
        }
      });
    });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
     
    }
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
  clock:function(e){
    wx.navigateTo({
      url: '../column/column?id=' + e.currentTarget.dataset.id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })  
  },

  // 选择时间
  bindTimeChange: function (e) {
    const that = this;
    that.setData({
      time : that.data.timeArray[e.detail.value]
    })
    const dk_time = that.data.time;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/user/setDKTxtime", { dk_time: dk_time }, function (res) {
      console.log(res.data)
      if (res.data.code == 200) {
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        })
      }
    });

  },

  // switch开关
  switch1Change: function (e) {
    var dk_shutdown;
    if (e.detail.value){
      dk_shutdown = 0;
    }else{
      dk_shutdown = 1;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/user/setDKTxstate", { dk_shutdown: dk_shutdown}, function (res) {
      console.log(res.data)
      if (res.data.code == 200) {
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        })
      }
    });
  },

  // switch评论开关
  switch2Change: function (e) {
    var dk_notifydown;
    if (e.detail.value) {
      dk_notifydown = 0;
    } else {
      dk_notifydown = 1;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/user/setDKTxnotify", { dk_notifydown: dk_notifydown}, function (res) {
      console.log(res.data)
      if (res.data.code == 200) {
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        })
      }
    });
  },
}) 
