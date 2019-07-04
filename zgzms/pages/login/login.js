// pages/login/login.js
const app = getApp()
const userApi = require('../../libraries/user.js')
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

  /**
   * 页面的初始数据
   */
  data: {
    mobile: false, //绑定手机号
    is_show: true,
    last_time: '',
    linkphone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  onShareAppMessage: function () {
  
  },
  onGetPhoneNum: function (e) {
    let that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      // 未授权
      that.setData({
        mobile: true,  //false
      })
    }else{
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_set_phone_number", {
        miniprog: 1,
        code: app.globalData.login_session_code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }, function (res) {
        console.log(res);
        if (res.data.code == 200){
          app.globalData.mobile = res.data.data.mobile;
          if (res.data.data.token != ""){
            app.globalData.userToken = res.data.data.token;
          }
          // 回调上一页函数
          prevPage.redirectTocallback();
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success: function (res) {

            }
          })
        }
      });
    }
  },
  bindphone: function (e) {
    this.setData({
      linkphone: e.detail.value
    })
  },
  // 获取验证码
  get_mobile_code: function () {
    var that = this;
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
    var reg = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/;
    
    var M = that.data.linkphone;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "User/wxcsms", {
      mobile: that.data.linkphone,
    }, function (res) {
      console.log(res)
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
    });
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
        that.setData({
          mobile: false,  //false
          cancle: true
        })
        wx.showModal({
          title: '提示',
          content: '绑定成功',
          showCancel: false,
          success: function (tres) {
            wx.navigateBack({
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
  cancle: function () {
    var that = this;
    that.setData({
      mobile: false,  //false
    })
  }
})