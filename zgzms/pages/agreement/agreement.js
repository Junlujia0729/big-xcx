

const app = getApp()
const userApi = require('../../libraries/user.js')
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classid:0,
    tjuid:0,
    groupid:0,
    group:0,
    url: '',
    agree:0,
    imgurl:'http://imgs.52jiaoshi.com/1531461309.png',
    datas:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.id){
      that.setData({ classid: options.id });
    }
    if (options.tjuid) {
      that.setData({
        tjuid: options.tjuid
      })
    }
    if (options.groupid) {
      that.setData({
        groupid: options.groupid
      })
    }
    if (options.group == 1) {
      that.setData({
        group: options.group
      })
    }

    userApi.xcx_login_new(1, 0, function () {

      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/agreement_xcx", {
        classid: that.data.classid
      }, function (res) {
        var article = res.data.data.content;
        WxParse.wxParse('article', 'html', article, that, 5);
        wx.setNavigationBarTitle({ title: res.data.data.title })
        
      });
    });
  },

  // 点击同意
  agree:function(e){
    let that = this;
    let agree = e.currentTarget.dataset.agree;
    if (agree){
      that.setData({
        imgurl:'http://imgs.52jiaoshi.com/1531461309.png',
        agree:0
      })  
    }else{
      that.setData({
        imgurl: 'http://imgs.52jiaoshi.com/1531462232.png',
        agree:1
      }) 
    }
  },

  // 下一步
  nextstep:function(e){
    let that = this;
    let _agree = e.currentTarget.dataset.agree;
    if(_agree){
      if (that.data.group){
        // 如果是拼团
        wx.navigateTo({
          url: '../order/order?id=' + that.data.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
        })
      }else{
        console.log('直接买课');
        // 如果是直接买课
        wx.navigateTo({
          url: '../order/order?id=' + that.data.classid + '&tjuid=' + that.data.tjuid,
        })
        
      }
      
    }else{
      wx.showModal({
        title: '提示',
        content: '请您阅读协议并点击同意',
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
    
  }
})
