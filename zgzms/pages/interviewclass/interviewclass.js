const app = getApp()
const userApi = require('../../libraries/user.js')
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    flag:false,
    play:0,
    items:[],
    video: { src: 'http://1251959798.vod2.myqcloud.com/53f82f3fvodtransgzp1251959798/fc7add3e4564972818589292853/v.f20.mp4', title: '不知道这些过不了面试，5分钟告诉你', dur:'05:00'},
    tjuid : 0,
    title:'',
    gohome:0,
    platform_ios:0,
  },
  onLoad(params) {
    const that = this;
    that.setData({
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    })
    if (params.scene && params.scene != "") {
      let scene = decodeURIComponent(params.scene);
      that.setData({
        tjuid: scene,
      });
      app.globalData.tjuid = scene;
    } else {
      if (params.id) {
        that.setData({
          tjuid : params.id,
        })
        app.globalData.tjuid = params.id;
      }
    }
    var pages = getCurrentPages().length;
    if (pages < 2) {
      that.setData({
        gohome: 1
      })
    }
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_zgzms_classlist", {
        id: that.data.tjuid
      }, function (res) {
        
        that.setData({
          items: res.data.data.items,
          video: res.data.data.video,
          title: res.data.data.title
        });

        if (res.data.data.title){
          wx.setNavigationBarTitle({
            title: res.data.data.title
          })
        }
      })
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '我爱教师网精品课程',
      path: '/pages/interviewclass/interviewclass?id=' + that.data.tjuid,
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
        //console.log(res1.shareTickets[0]);
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
  onPullDownRefresh: function () {
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_zgzms_classlist", {
        id: that.data.tjuid
      }, function (res) {
        that.setData({
          items: res.data.data.items,
          video: res.data.data.video,
        });
      })
    });
    wx.stopPullDownRefresh();
  },
  chapter: function (){
    var that = this;
    that.setData({
      flag :true
    })
  },

  play: function(e){
    var that = this;
    that.setData({
      play: 1
    });
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType != "wifi"){
          wx.showModal({
            title: '流量提醒',
            content: '您当前不是在wifi网络下，将消耗约18M流量，继续吗？',
            success : function(res){
              if (res.confirm) {
                var videoContext = wx.createVideoContext('myVideo');
                videoContext.play();
              } else if (res.cancel) {
                that.setData({
                  play: 0
                });
              }
            },fail : function (res){
              var videoContext = wx.createVideoContext('myVideo');
              videoContext.play();
            }
          })
        }else{
          var videoContext = wx.createVideoContext('myVideo');
          videoContext.play();
        }
      }, fail : function(res){
        var videoContext = wx.createVideoContext('myVideo');
        videoContext.play();
      }
    })
  }, 
  gotoClass: function (e) {
    const that = this;
    if (e.currentTarget.dataset.viewtype == 2) {
      wx.navigateTo({
        url: '../childlist/childlist?id=' + e.currentTarget.dataset.id + '&tjuid=' + that.data.tjuid,
      })
    } else {
      wx.navigateTo({
        url: '../classx/classx?id=' + e.currentTarget.dataset.id + '&tjuid=' + that.data.tjuid,
      })
    }
  },
  
  //回到首页
  retuen: function () {
    wx.switchTab({
      url: '../home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})  
