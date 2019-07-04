const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    url:"",
    oldurl:"",
  },
  onLoad(params) {
    console.log(params);
    const that = this;
    if (params.id == 0){
      that.setData({
        oldurl: "https://api.duobeiyun.com/test/api/server/add_test_cookie",
        url: "https://api.duobeiyun.com/test/api/server/add_test_cookie"
      });
    } else if (params.id == 1) {
      that.setData({
        oldurl: "https://api.duobeiyun.com/test/api/server/remove_test_cookie",
        url: "https://api.duobeiyun.com/test/api/server/remove_test_cookie"
      });
    }else {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "ApiNlpgbg/xcx_class_play", { id: params.id }, function (res) {
        that.setData({
          oldurl: res.data.data.url,
          url: res.data.data.url
        });
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("show" + this.data.url);
    // if (this.data.oldurl != ""){
    //   this.setData({
    //     url: this.data.oldurl,
    //   });
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //wx.stopVoice();
    // const innerAudioContext = wx.createInnerAudioContext();
    // console.log(innerAudioContext);
    // innerAudioContext.stop();
    // this.setData({
    //   url: this.data.oldurl + "&" + Math.random()
    // });
    //console.log("hide" + this.data.url);
    // wx.navigateBack({
    //   delta:1
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //console.log("unload");
  }
})