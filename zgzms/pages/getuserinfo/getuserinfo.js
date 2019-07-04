// pages/login/login.js
const app = getApp()
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addcommentType:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that =this;
    if (options.addcommentType){
      that.setData({
        addcommentType: options.addcommentType
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
  onGetUserInfo: function (e) {
    let that = this;
    console.log(e);
    console.log(e.detail.errMsg);
    console.log(e.detail.userInfo);
    console.log(e.detail.rawData);

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    if (e.detail.errMsg == 'getUserInfo:fail user deny') {
      // 未授权
      
    }else{
      app.globalData.nickname = e.detail.userInfo.nickName;
      app.globalData.headimgurl = e.detail.userInfo.avatarUrl;
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_set_user_info", {
        miniprog: 1,
        nickname: e.detail.userInfo.nickName,
        headimgurl: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender,
        city: e.detail.userInfo.city,
        province: e.detail.userInfo.province
      }, function (res2) {
        //addcommentType 1打卡  2回复主评论 3回复子评论
        if (that.data.addcommentType == 1) {
          prevPage.redirectToAdd();
        } else if (that.data.addcommentType == 2) {
          prevPage.redirectToComment();
        } else if (that.data.addcommentType == 3) {
          prevPage.redirectToReplay();
        }
      });
    }
  }
})