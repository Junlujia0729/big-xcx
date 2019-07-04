// pages/bind/bind.js
const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑、
var countdown = 60;
var settime = function (that) {
  if (countdown == 0) {
    that.setData({
      is_show: true
    })
    countdown = 60;
    return;
  } else {
    that.setData({
      is_show: false,
      last_time: countdown
    })

    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }
    , 1000)
}
Page({
  data: {
    show:true,
    is_show:true,
    hidden: true
  },
  onLoad(params) {
    const that = this;
    userApi.xcx_login_new(1,0,function () {
      if (app.globalData.mobile){
        wx.switchTab({
          url: '../myinfo/myinfo',
        })
      }
    });
  },

  bindphone: function (e) {
    this.setData({
      linkphone: e.detail.value
    })
  },

  // 获取验证码
  get_mobile_code: function () {
    var that = this;
    that.setData({
      hidden: !that.data.hidden
    });
    setTimeout(function () {
      if (that.data.linkphone == "") {
        wx.showModal({
          title: '提示',
          content: '亲，手机号码还没有填哦！',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      };
      var reg = /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;

      var M = that.data.linkphone;
      if (M.length != 11 || !reg.test(M)) {
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      }
      userApi.requestAppApi_POST(app.globalData.mainDomain + "User/wxcsms", {
        mobile: that.data.linkphone,
        openId: app.globalData.openId,
        wx_ltk: app.globalData.wx_ltk
      }, function (res) {
        console.log(res)
        that.setData({
          hidden: !that.data.hidden
        });
        if (res.data.code == 0) {
          that.setData({
            is_show: false   //false
          })
          settime(that);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success: function (res) {

            }
          })
        }
      })
    }, 200);  
  },

  checkmobile: function (e) {
    var that = this;
    var mobile = e.detail.value.mobile;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "App/wxbind", {
      mobile: e.detail.value.mobile,
      captcha: e.detail.value.verifycode
    }, function (res) {
      if (res.data.code == 200) {
        app.globalData.mobile = mobile;
        app.globalData.userToken = res.data.data.token;
        wx.showModal({
          title: '提示',
          content: '绑定成功',
          showCancel: false,
          success: function (tres) {
            wx.switchTab({
              url: '../myinfo/myinfo',
            })
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false,
          success: function (res) {

          }
        })
      }
    });
  },
})  
