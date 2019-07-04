// pages/columnorder/columnorder.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    columnid: 0,
    payinfo: [],
    prepay_id: '',
    hidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({ columnid: options.id });
    
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    var items = prevPage.data.items;
    console.log(items);
    that.setData({
      payinfo: items
    });
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
  confirmOrder: function (e) {
    const that = this;
    that.setData({
      hidden: !that.data.hidden
    });
    //正常购课支付
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/Index/wxpay", {
      column_id: that.data.columnid,
      openid: app.globalData.openId
    }, function (res) {
      that.setData({
        prepay_id: res.data.data.prepay_id,
        hidden: !that.data.hidden
      });
      wx.requestPayment(
        {
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonce_str,
          'package': 'prepay_id=' + res.data.data.prepay_id,
          'signType': 'MD5',
          'paySign': res.data.data.paysign,
          'success': function (res) {
          },
          'fail': function (res) { },
          'complete': function (res) {
            if (res.errMsg == "requestPayment:ok") {
              //上报formid
              userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_formid", { formid: that.data.prepay_id, openid: app.globalData.openId, type: 'pay' }, function (res) {
              });
              wx.redirectTo({
                url: '../paycolumnresult/paycolumnresult?id=' + that.data.columnid
              })
            } else {
              
            }
          }
        })
    });
  }
})