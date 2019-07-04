// pages/queryscore/queryscore.js
const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname: '',
    zjhm: "",
    yzm: "",
    imgurl : "",
    formid : "",
    info : '',
    channel:1,
    d_yzm:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this
    if (options.channel){
      that.setData({
        channel: options.channel
      })
    }
    
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiJiucuo/xcx_chafen_template", {
        openid: app.globalData.openId, token: app.globalData.wx_ltk, channel: that.data.channel
      }, function (res) {
        console.log(res.data);  
        var fileds = res.data.data.template.fileds;
        for (var i = 0; i < fileds.length;i++){
          if (fileds[i].type == 1){
            fileds[i].inputtype = 'text';
          } else if (fileds[i].type == 2){
            fileds[i].inputtype = 'number';
          } else if (fileds[i].type == 3) {
            fileds[i].inputtype = 'idcard';
          } else if (fileds[i].type == 4) {
            fileds[i].inputtype = 'yzm';
            that.setData({
              imgurl: app.globalData.mainQueryDomain + "ApiJiucuo/xcx_chafen_chaptcha?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk + "&tt=" + Math.random() + "&channel=" + that.data.channel,
            });
          }      
        }
        that.setData({
          items: res.data.data.template
        })
        
      })
      

    });
  },

  refresh:function(){
    const that = this  
    // that.setData({
    //   imgurl: app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_queryScoreCaptchaByUid?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk + "&tt=" + Math.random(),
    // });
    that.setData({
      imgurl: app.globalData.mainQueryDomain + "ApiJiucuo/xcx_chafen_chaptcha?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk + "&tt=" + Math.random() + "&channel=" + that.data.channel,
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
    const that = this;
    if (that.data.imgurl != ''){
      that.setData({
        d_yzm: '',
        imgurl: app.globalData.mainQueryDomain + "ApiJiucuo/xcx_chafen_chaptcha?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk + "&tt=" + Math.random() + "&channel=" + that.data.channel,
      });
    }
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
    that.setData({
      info: ''
    });
    if (that.data.imgurl != '') {
      that.setData({
        d_yzm: '',
        imgurl: app.globalData.mainQueryDomain + "ApiJiucuo/xcx_chafen_chaptcha?openid=" + app.globalData.openId + "&token=" + app.globalData.wx_ltk + "&tt=" + Math.random() + "&channel=" + that.data.channel,
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
  onShareAppMessage: function (res) {
    
    return {
      title: '教师资格证成绩查询',
      path: '/pages/queryscore/queryscore',
      // imageUrl: 'http://www.52jiaoshi.com/download/52_green.jpg',
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat_uid", {
          scene: scene, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk
        }, function (shres) {

        });
        // 转发成功,通过res1.shareTickets[0]获取转发ticket
        //console.log(res1.shareTickets[0]);
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
  binduname: function (e) {
    this.setData({
      uname: e.detail.value
    })
  },
  bindzjhm: function (e) {
    this.setData({
      zjhm: e.detail.value
    })
  },
  bindyzm: function (e) {
    this.setData({
      yzm: e.detail.value
    })
  },

  // queryScore : function (e){
  //   wx.navigateTo({
  //     url: '../queryscoreresult/queryscoreresult?uname=' + encodeURI(this.data.uname) + "&zjhm=" + this.data.zjhm + "&yzm=" + this.data.yzm,
  //   })
  // },

  queryScore: function (e) {
    console.log(e);
    const that =this;
    let url = '../queryscoreresult/queryscoreresult?channel=' + that.data.channel;
    for (var i in e.detail.value) {
      if (e.detail.value[i] == "") {
        wx.showModal({
          title: '提示',
          content: '请输入完整信息',
          showCancel: false
        })
        return false;
      }
      // if (i == "zjhm" && e.detail.value[i] == "" || e.detail.value[i].length < 15) {
      //   wx.showModal({
      //     title: '提示',
      //     content: '请输入正确的证件号码',
      //     showCancel: false
      //   })
      //   return false;
      // }
      // if (i == "yzm" && e.detail.value[i] == "" || e.detail.value[i].length < 4) {
      //   wx.showModal({
      //     title: '提示',
      //     content: '请输入验证码',
      //     showCancel: false
      //   })
      //   return false;
      // }
      url += '&'+ i + '=' + e.detail.value[i];
    }
    that.setData({
      formid: e.detail.formId
    });
    wx.navigateTo({
      url: url + "&formid=" + that.data.formid,
    })  
  }
})