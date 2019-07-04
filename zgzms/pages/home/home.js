// pages/home/home.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    platform_ios: 0,
    userInfo: [],
    items: [],
    columns:[],
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    mask: false,
    maskdata: [],
    routers:[],
    swiperHeight:'250rpx',
    navitems:[]
  },
  getphone:{},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    });

    if (options.scene && options.scene != "") {
      let scene = decodeURIComponent(options.scene);
      app.globalData.scene_type = scene;
    }
    userApi.xcx_login_new(1, 1, function () {
      that.setData({
        userInfo: {
          nickname: app.globalData.nickname,
          headimgurl: app.globalData.headimgurl,
        }
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/banner", {}, function (res) {
        if (res.data.data.adv && res.data.data.adv.length) {
          //banner
          that.setData({
            imgUrls: res.data.data.adv,
            swiperHeight: '500rpx'
          });
        } else {
          if (res.data.data.banner && res.data.data.banner.length) {
            that.setData({
              imgUrls: res.data.data.banner
            });
          }
        }
        if (res.data.data.navigation && res.data.data.navigation.length) {
          //route
          var _l = 0;
          var _routers = [];
          var length = res.data.data.navigation.length;
          _routers[0] = new Array();
          for (var ii = 1; ii <= length;ii++){
            _routers[_l].push(res.data.data.navigation[ii - 1]);
            if (ii % 4 == 0 && ii != length ){
              _routers[++_l] = new Array();
            }  
          }
          console.log(_routers);
          that.setData({
            routers: _routers
          });
        }
      })
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_homelist", {}, function (res) {
        that.setData({
          items: res.data.data.classes,
          columns: res.data.data.columns,
        });
      })
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/bomb_box", { scene: app.globalData.scene_type}, function (res) {
        // console.log(res.data);
        if (res.data.data.id) {
          that.setData({
            mask: true,
            maskdata: res.data.data
          });
        }
      })
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/navigation", {}, function (res) {
        that.setData({
          navitems: res.data.data
        });
      })
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
  gotoClass: function (e) {
    if (e.currentTarget.dataset.viewtype == 2) {
      wx.navigateTo({
        url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
      })
    } else {
      wx.navigateTo({
        url: '../classx/classx?id=' + e.currentTarget.dataset.id,
      })
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
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/banner", {}, function (res) {
        if (res.data.data.adv && res.data.data.adv.length) {
          //banner
          that.setData({
            imgUrls: res.data.data.adv,
            swiperHeight: '500rpx',
          });
        } else {
          if (res.data.data.banner && res.data.data.banner.length) {
            that.setData({
              imgUrls: res.data.data.banner
            });
          }
        }
        if (res.data.data.navigation && res.data.data.navigation.length) {
          //route
          var _l = 0;
          var _routers = [];
          var length = res.data.data.navigation.length;
          _routers[0] = new Array();
          for (var ii = 1; ii <= length; ii++) {
            _routers[_l].push(res.data.data.navigation[ii - 1]);
            if (ii % 4 == 0 && ii != length) {
              _routers[++_l] = new Array();
            }
          }
          that.setData({
            routers: _routers
          });
        }
      })
      userApi.requestAppApi_POST(app.globalData.mainDomain + "ApiNlpgbg/xcx_homelist", {}, function (res) {
        that.setData({
          items: res.data.data.classes,
          columns: res.data.data.columns
        });
      })
      // userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/bomb_box", {}, function (res) {
      //   // console.log(res.data);
      //   if (res.data.data.id) {
      //     that.setData({
      //       mask: true,
      //       maskdata: res.data.data
      //     });
      //   }
      // })
    });
    
    wx.stopPullDownRefresh();
  },
  selectcolumn: function (e) {
    wx.navigateTo({
      url: '../column/column?id=' + e.currentTarget.dataset.id,
    })
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
    return {
      title: '我爱教师网',
      path: '/pages/home/home',
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
  swiperImageLoad : function (e){
    var that = this;
    if (e.currentTarget.dataset.index == 0){
      var originWidth = e.detail.width,
        originHeight = e.detail.height,
        ratio = originWidth / originHeight;
      
      // that.setData({
      //       swiperHeight: (app.globalData.systemInfo.windowWidth / ratio) + 'px'
      // });
    }
  },
  // 关闭弹窗
  close_mask: function () {
    var that = this;
    that.setData({
      mask: false
    });
  },
  //点击banner
  clickBanner: function (e) {
    var that = this;
    if (that.data.imgUrls[e.currentTarget.dataset.index].getphone == 1 && app.globalData.mobile == "") {
      that.getphone.path = that.data.imgUrls[e.currentTarget.dataset.index].path;
      that.getphone.title = that.data.imgUrls[e.currentTarget.dataset.index].title;
      that.getphone.open_type = that.data.imgUrls[e.currentTarget.dataset.index].open_type;
      //未设置电话号码
      wx.navigateTo({
        url: '../getphone/getphone?popid=3',
      })
    } else {
      userApi.gotoActivityPage(that.data.imgUrls[e.currentTarget.dataset.index].path, that.data.imgUrls[e.currentTarget.dataset.index].title, that.data.imgUrls[e.currentTarget.dataset.index].open_type, function () {

      });
    }
  },
  clickNav: function(e){
    var that = this;
    userApi.gotoActivityPage(that.data.navitems[e.currentTarget.dataset.pindex].items[e.currentTarget.dataset.index].path, that.data.navitems[e.currentTarget.dataset.pindex].items[e.currentTarget.dataset.index].title, that.data.navitems[e.currentTarget.dataset.pindex].items[e.currentTarget.dataset.index].open_type, function () {

    });
  },
  // 点击模块
  clickRouter: function (e) {
    var that = this;
    if (that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].getphone == 1 && app.globalData.mobile == "") {
      that.getphone.path = that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].path;
      that.getphone.title = that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].title;
      that.getphone.open_type = that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].open_type;
      //未设置电话号码
      wx.navigateTo({
        url: '../getphone/getphone?popid=3',
      })
    } else {
      userApi.gotoActivityPage(that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].path, that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].title, that.data.routers[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].open_type, function () {

      });
    }

  },
  //点击默认弹窗
  clickBomb: function (e) {
    var that = this;
    if (that.data.maskdata.getphone == 1 && app.globalData.mobile == "") {
      that.getphone.path = that.data.maskdata.path;
      that.getphone.title = that.data.maskdata.title;
      that.getphone.open_type = that.data.maskdata.open_type;
      //未设置电话号码
      wx.navigateTo({
        url: '../getphone/getphone?popid=3',
      })
    } else {
      userApi.gotoActivityPage(that.data.maskdata.path, that.data.maskdata.title, that.data.maskdata.open_type, function () {
        that.setData({
          mask: false
        });
      });
    }
  },
  // 关闭弹窗
  TopublicActivityCall: function (e) {
    var that = this;
    that.setData({
      mask:false
    });
  },
  // 需要设置手机号的公共活动页
  TopublicActivity: function () {
    var that = this;
    if (that.getphone.path.indexOf("http://") == -1 && that.getphone.path.indexOf("https://") == -1) {
      if (that.getphone.open_type == "switchTab") {
        wx.switchTab({
          url: '../' + that.getphone.path,
          success: function () {
            that.TopublicActivityCall();
          }
        });
      } else {
        wx.redirectTo({
          url: '../' + that.getphone.path,
          success: function () {
            that.TopublicActivityCall();
          }
        })
      }
    } else {
      app.globalData.activityUrl = that.getphone.path;
      app.globalData.activityTitle = that.getphone.title;
      wx.redirectTo({
        url: '../activity/activity',
        success: function () {
          that.TopublicActivityCall();
        }
      })
    }
  },
})