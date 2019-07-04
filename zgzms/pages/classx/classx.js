const app = getApp()
const userApi = require('../../libraries/user.js')
var WxParse = require('../../wxParse/wxParse.js');
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    /** 
        * 页面配置 
        */
    userInfo: [],
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    classid:0,
    page: 1,
    items: [] ,
    time: [],
    classlist:[],
    teacherlist:[],
    nodes:[],
    nodes1: [],
    flag:false,
    play:0,
    received:0,
    show: true,
    cancle: false,
    on_load:0,
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    isshare:0,
    tjuid:0,
    isgroup:'',  //是否是拼课
    gohome: 0,
    system:'',
    platform:'',
    platform_ios:0,
    guideApp:0
  },
  buyclass_type:0,
  onLoad(options) {
    console.log(options);
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    
    const that = this;
    that.setData({
      platform: app.globalData.systemInfo.platform,
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    })
    // options.id = 11475;
    // options.tjuid = 1173129;
    var theclassid = 0;
    if (options.scene && options.scene != ""){
      let scene = decodeURIComponent(options.scene);
      let scparams = scene.split("#");
      console.log(scparams);
      theclassid = scparams[0];
      that.setData({
        classid: scparams[0],
        tjuid: scparams.length > 1 ? scparams[1] : 0,
      });
    }else{
      theclassid = options.id;
      that.setData({
        classid: theclassid,
      });
      if (options.tjuid) {
        that.setData({
          tjuid: options.tjuid,
        })
      } else {
        if (app.globalData.tjuid > 0){
          that.setData({
            tjuid: app.globalData.tjuid,
          })
        } 
      }
      if (options.share) {
        that.setData({
          share: options.share,
        });
      } 
    }
    var pages = getCurrentPages().length;
    if (pages < 2) {
      that.setData({
        gohome: 1
      })
    }
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        userInfo: {
          nickname: app.globalData.nickname,
          headimgurl: app.globalData.headimgurl,
          userToken: app.globalData.userToken,
        }
      });
      var options11 = { classid: theclassid, platform: app.globalData.systemInfo.platform};
      if (options.groupid){
        that.setData({
          groupid: options.groupid
        });
        options11 = Object.assign({ groupid: options.groupid }, options11);
      }
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/isPay", options11, function (res) {
        console.log(res.data.data);
        res.data.data.begintime = res.data.data.begintime.substr(0, 10);
        that.setData({
          datas: res.data.data,
          on_load: 1
        });
        if (res.data.data.group_rule && res.data.data.group_rule.groupid ){
          //循环已加入用户
          that.setData({
            groupid: res.data.data.group_rule.groupid
          });
        }
        wx.setNavigationBarTitle({ title: res.data.data.classname});
      }); 

      //静态信息和拼团列表
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/detail", {
        classid: theclassid,
      }, function (res) {
        // console.log(res.data.data);
        let subArrayNum = 2;
        var dataArr = new Array(Math.ceil(res.data.data.groups.length / subArrayNum));
        for (let i = 0; i < dataArr.length; i++) {
          dataArr[i] = new Array();
          for (let j = 0; j < subArrayNum; j++) {
            dataArr[i][j] = '';
          }
        }
        for (let i = 0; i < res.data.data.groups.length; i++) {
          dataArr[parseInt(i / subArrayNum)][i % subArrayNum] = res.data.data.groups[i];
        } 
        var grouplist = dataArr;
        that.setData({
          grouplist: grouplist,
          classlist: res.data.data.chapters,
          video: res.data.data.video
        });
      }); 
      
      //老师简介
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/teacherlist", {
        classid: theclassid,
      }, function (res) {
        // console.log(res.data.data);
        that.setData({
          teacherlist: res.data.data
        });
      });

      //课程详情
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/detail40xcx", {
        classid: theclassid,
        ios: that.data.platform_ios ? 1 : 0
      }, function (res) {
        // console.log(res.data.data);
        var article = res.data.data.detail;
        WxParse.wxParse('article', 'html', article, that, 5);
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/share_setting", {
        classid: that.data.classid,
      }, function (res) {
        that.setData({
          sharedatas:res.data.data
        })
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  //试学点击
  chapter: function (){
    var that = this;
    that.setData({
      flag :true
    })
  },

  //关闭试学
  closetrial: function (){
    var that = this;
    that.setData({
      flag: false
    })  
  },

  // play: function(){
  //   var that = this;
  //   that.setData({
  //     play: 0
  //   }) 
  // },

  //领取优惠券
  get_coupons:function(e){
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Weekly/coupon", {
      id: e.currentTarget.dataset.id,
    }, function (res) {
      if (res.data.code==200){
        console.log(res.data);
        that.data.datas.discount.unshift(res.data.data);
        that.setData({
          received:1
        });
        wx.showModal({
          title: '恭喜您',
          content: '领取成功',
          showCancel: false,
          success: function (res) {  
          }
        })
      }else{
        wx.showModal({
          title: '抱歉',
          content: '领取失败',
          showCancel: false,
          success: function (res) {

          }
        })
      }
    });
  },
  //立即购买
  buy:function(){
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      // buyclass_type 1立即购买 2拼课购买 3 0元课购买
      that.buyclass_type = 1;
      return;
    }
    wx.navigateTo({
      url: '../order/order?id=' + that.data.datas.classid + '&tjuid=' + that.data.tjuid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    });
    
    // if (app.globalData.mobile == '' && (that.data.datas.price > 50 || that.data.datas.pay_company ==2)) {
    //   that.setData({
    //     mobile: true,   //false
    //     isgroup: false
    //   })
    // } else {
    //   if (userApi.xcx_can_buy(0)) {
        
    //   } else {
    //     //没有unionid
    //     userApi.xcx_reget_userinfo(function () {
    //       wx.navigateTo({
    //         url: '../order/order?id=' + that.data.datas.classid + '&tjuid=' + that.data.tjuid,
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       });
    //     });
    //   }  
    // }    
  },

  //拼课购买
  spell: function (e) {
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      // buyclass_type 1立即购买 2拼课购买 3 0元课购买
      that.buyclass_type = 2;
      return;
    }
    wx.navigateTo({
      url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    });
    // if (app.globalData.mobile == '' && (that.data.datas.group_rule.price > 50 || that.data.datas.pay_company == 2)) {
    //   that.setData({
    //     mobile: true,   //falsecheckmobile
    //     isgroup: true
    //   })
    // } else {
    //   if (userApi.xcx_can_buy(0)) {
        
    //   } else {
    //     //没有unionid
    //     userApi.xcx_reget_userinfo(function () {
    //       wx.navigateTo({
    //         url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
    //         success: function (res) { },
    //         fail: function (res) { },
    //         complete: function (res) { },
    //       })
    //     });
    //   }    
    // }
  },

   /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.sharedatas.title,
      path: that.data.sharedatas.path,
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat", {
          scene: scene, openid: app.globalData.openId
        }, function (shres) {

        });
        // that.setData({
        //   isshare: 1
        // })
        // 转发成功,通过res1.shareTickets[0]获取转发ticket
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },

  look:function(e){
    var that = this;
    if (!userApi.xcx_check_mobile_empty()){
      // buyclass_type 1立即购买 2拼课购买 3 0元课购买
      that.buyclass_type = 3;
      return;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Live/join", {
      classid: that.data.classid,
    }, function (res) {
      wx.redirectTo({
        url: '../payresult/payresult?id=' + that.data.classid
      })
    });
  },
  spelling:function(e){
    var that=this;
    wx.navigateTo({
      url: '../groupclass/groupclass?groupid=' + e.currentTarget.dataset.id + '&tjuid=' + that.data.tjuid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })  
  },

  go_spell:function(e) {
    var that = this;
    wx.navigateTo({
      url: '../sharegroup/sharegroup?groupid=' + e.currentTarget.dataset.groupid + '&tjuid=' + that.data.tjuid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  rule:function(){
    wx.navigateTo({
      url: '../grouprule/grouprule',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })   
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (options) {
    const that = this
    userApi.xcx_login_new(1, 0, function () {
      var options11 = { classid: that.data.classid };
      if (that.data.groupid) {
        options11 = Object.assign({ groupid: that.data.groupid }, options11);
      }
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Course/isPay", options11, function (res) {
        res.data.data.begintime = res.data.data.begintime.substr(0, 10);
        that.setData({
          datas: res.data.data,
          on_load: 1
        });
        if (res.data.data.group_rule && res.data.data.group_rule.groupid) {
          //循环已加入用户
          that.setData({
            groupid: res.data.data.group_rule.groupid
          });
        }
        wx.setNavigationBarTitle({ title: res.data.data.classname });
      });
    });  
    wx.stopPullDownRefresh();
  },

  play: function (e) {
    var that = this;
    that.setData({
      play: 1
    });
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType != "wifi") {
          wx.showModal({
            title: '流量提醒',
            content: '您当前不是在wifi网络下，将消耗约18M流量，继续吗？',
            success: function (res) {
              if (res.confirm) {
                var videoContext = wx.createVideoContext('myVideo');
                videoContext.play();
              } else if (res.cancel) {
                that.setData({
                  play: 0
                });
              }
            }, fail: function (res) {
              var videoContext = wx.createVideoContext('myVideo');
              videoContext.play();
            }
          })
        } else {
          var videoContext = wx.createVideoContext('myVideo');
          videoContext.play();
        }
      }, fail: function (res) {
        var videoContext = wx.createVideoContext('myVideo');
        videoContext.play();
      }
    })
  }, 

  // 关闭公众号二维码
  closeMask:function(){
    const that = this;
    that.setData({
      isshare:0
    })
  },

  previewImage: function (e) {
    wx.showModal({
      title: '提示',
      content: '长按事件被触发',
      showCancel: false
    });
  }, 

  creatcard:function(e){
    const that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      wx.navigateTo({
        url: '../invitationcard/invitationcard?classid=' + that.data.classid,
      })
    });
  },

  //立即购买 非0元课
  buyclass: function (e) {
    var that = this;
    console.log(e.detail.formId);
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk}, function (res) {
      if (that.data.datas.payup == 0){
        wx.showModal({
          title: '打开我爱教师APP了解更多',
          content: '基于微信小程序平台的运营规范，请打开我爱教师APP了解更多关于课程内容。您可在应用市场搜索 “我爱教师” 下载安装',
          showCancel:false,
          confirmText:'知道了',
          success: function (res) {
            
          }
        }) 
        return;
      }
      if (that.data.datas.need_agreement){
        wx.navigateTo({
          url: '../agreement/agreement?id=' + that.data.datas.classid + '&tjuid=' + that.data.tjuid,
        })
      }else{
        that.buy();
      }
      
    });
  },

  //立即购买 0元课
  buyfreeclass: function (e) {
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      that.look();
    });
  },

  //拼课购买 0元课
  spellclass: function (e) {
    var that = this;
    that.setData({
      groupid: e.detail.value.id
    })
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      if(that.data.datas.payup == 0){
        wx.showModal({
          title: '请前往我爱教师APP购买',
          content: '基于微信小程序平台的运营规范，我爱教师小程序暂不支持购买，请前往我爱教师APP完成购买',
          showCancel: false,
          confirmText: '知道了',
          success: function (res) {

          }
        })
        return;
      }
      if (that.data.datas.need_agreement) {
        wx.navigateTo({
          url: '../agreement/agreement?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
        })
      } else {
        that.spell();
      }
      
    });
  },

  //回到首页
  retuen: function () {
    wx.switchTab({
      url: '../home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  // 引导APP
  guideApp:function(){
    const that = this;
    that.setData({
      guideApp:1
    }) 
  },

  closeguideApp:function() {
    const that = this;
    that.setData({
      guideApp: 0
    })
  },

  // 获取手机号回调
  redirectTocallback: function () {
    var that = this;
    // buyclass_type 1立即购买 2拼课购买 3 0元课购买
    if (that.buyclass_type == 1){
      wx.redirectTo({
        url: '../order/order?id=' + that.data.datas.classid + '&tjuid=' + that.data.tjuid,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      });
    } else if (that.buyclass_type == 2){
      wx.redirectTo({
        url: '../order/order?id=' + that.data.datas.classid + '&group=1&groupid=' + that.data.groupid + '&tjuid=' + that.data.tjuid,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      });
    } else if (that.buyclass_type == 3){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Live/join", {
        classid: that.data.classid,
      }, function (res) {
        wx.redirectTo({
          url: '../payresult/payresult?id=' + that.data.classid
        })
      });
    }
    
  },
})  
