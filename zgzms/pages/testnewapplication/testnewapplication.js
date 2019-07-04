// pages/login/login.js
const app = getApp()
const userApi = require('../../libraries/user.js')



Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:1,
    show:1,
    animation:{},
    animationMiddleHeaderItem:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var circleCount = 0;
    // 心跳的外框动画        
    this.animationMiddleHeaderItem = wx.createAnimation({
      duration: 1000, // 以毫秒为单位         
      timingFunction: 'linear',
      delay: 100,
      transformOrigin: '50% 50%',
      success: function (res) { }
    });

    setInterval(function () {
      if (circleCount % 2 == 0) {
         this.animationMiddleHeaderItem.scale(1.15).step();
      } else { this.animationMiddleHeaderItem.scale(1.0).step(); } this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()  //输出动画       
      });

      circleCount++;
      if (circleCount == 1000) {
        circleCount = 0;
      }
    }.bind(this), 1000);  
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
  recite:function(){
    let that =this;
    that.setData({
      active:0,
      show:0
    })
  },
  bindTouchEnd:function(){
    let that = this;
    that.setData({
      active: 1,
      show: 1
    })
  },
  onReady: function () {
    this.animation = wx.createAnimation()
  },
  rotateThenScale: function () {
    this.animation.translate3d(80, -150, 0).step()
      .scale(.01, .01).step().right(800).step()
    this.setData({ animation: this.animation.export() })
  }

})