const app = getApp();
const userApi = require('../../libraries/user.js');
var WxParse= require('../../wxParse/wxParse.js');
var utilComment = require('../common/commentlist.js');
var px2rpx = 2, windowWidth = 375;

// 播放
const innerAudioContext = wx.createInnerAudioContext();
var interval;
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
// 创建一个页面对象用于控制页面的逻辑
Page(utilComment.ext_comment_config({
  data: {
    // tab切换  
    nickname:'',
    headimgurl:'',
    column_new_class:[],
    column_my_dialy:[],
    common_comment_list:[],
    currentTab: 0,
    column_id:0,
    items: [] ,
    time: [],
    classlist:[],
    teacherlist:[],
    flag:false,
    play:1,
    linkphone: '',
    last_time: '',
    mobile: false,
    show: true,
    is_show: true,
    cancle: false,
    is_loadingmore: 0,
    loadingmore_text: '正在加载',
    // 音频
    uptoken:'',
    platform:'',
    guideApp: 0
  },
  buycolumn_type:0,
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    var columnid = params.id;
    // columnid = 38;
    that.setData({
      column_id: columnid,
      platform: app.globalData.systemInfo.platform
    });

    userApi.xcx_login_new(1,0,function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_info", { column_id: columnid}, function (res) {
        // console.log(res.data.data);
        that.setData({
          items: res.data.data,
        });

        if (res.data.data.is_buy == 1){
          //如果已经购买过
          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_new_class_list", { column_id: columnid }, function (res) {
            that.setData({
              column_new_class: res.data.data.class,
            });
          });
          

          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_my_dialy", { column_id: columnid }, function (res) {
            that.setData({
              column_my_dialy: res.data.data,
            });
          });

          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_lastcomment", { column_id: columnid }, function (res) {
            var _common_comment_list = res.data.data;
            if (_common_comment_list && _common_comment_list.length > 0) {
              for (let i = 0; i < _common_comment_list.length; i++) {
                if (_common_comment_list[i].audio) {
                  //innerAudioContext.src = _common_comment_list[i].audio;
                  // 音频播放进度更新
                  _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
                  _common_comment_list[i].process_time = '00:00';
                  _common_comment_list[i].ap_progress = 0;
                  _common_comment_list[i].playstate = 'pause';
                  _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
                }

                // 如果回复里有音频
                if (_common_comment_list[i].reply_list && _common_comment_list[i].reply_list.length > 0) {
                  let replylist = _common_comment_list[i].reply_list;
                  for (var j = 0; j < replylist.length; j++) {
                    if (replylist[j].audio) {
                      replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                      replylist[j].reply_playstate = 'pause';
                      replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                    }
                  }
                }
              }
              that.setData({
                common_comment_list: _common_comment_list
              })
              console.log(that.data.common_comment_list);
            }
          });
        }

        var article = res.data.data.content + '<p style="text-align:center;"><strong>订阅须知</strong></p>' + res.data.data.notice;
        WxParse.wxParse('article', 'html', article, that, 5);
        //var notice = res.data.data.notice; 
        //WxParse.wxParse('notice', 'html', notice, that, 5);
        //wx.setNavigationBarTitle({ title: res.data.data.title});
      });
    });

    
    innerAudioContext.onEnded(function (res) {
      innerAudioContext.seek(0);
      that.setData({
        ap_progress: 0,
        process_time: '00:00',
        play_img: 'http://imgs.52jiaoshi.com/1530841265.png',
        playstate: 'pause'
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
  trial: function (e){
    const that = this;
    wx.navigateTo({
      url: '../columntrial/columntrial?id=' + that.data.column_id,
    })
  },
  //0 元订阅
  join: function (e) {
    const that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      // buycolumn_type 1 0元订购 2付费
      that.buycolumn_type = 1;
      return;
    }
    that.joinfree();
  },
  joinfree: function (){
    var that =this;
    var columnid = that.data.column_id;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/zero_order", { column_id: columnid }, function (res1) {
      if (res1.data.code == 206 || res1.data.code == 200) {
        if (that.data.items.is_dialy_class == 1) {
          //打卡刷新当前页
          that.setData({
            'items.is_buy': 1,
          });

          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_new_class_list", { column_id: columnid }, function (res) {
            that.setData({
              column_new_class: res.data.data.class,
            });
          });

          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_my_dialy", { column_id: columnid }, function (res) {
            that.setData({
              column_my_dialy: res.data.data,
            });
          });

          userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_lastcomment", { column_id: columnid }, function (res) {
            that.setData({
              common_comment_list: res.data.data,
            });
          });
        } else {
          //非打卡跳转
          wx.navigateTo({
            url: '../columndetail/columndetail?id=' + that.data.column_id,
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res1.data.msg,
        })
      }
    }); 
  },
  Listen:function(e){
    const that = this;
    wx.navigateTo({
      url: '../columndetail/columndetail?id=' + that.data.column_id,
    })
  },
  //立即购买
  buy:function(){
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      // buycolumn_type 1 0元订购 2付费
      that.buycolumn_type = 2;
      return;
    }
    wx.navigateTo({
      url: '../columnorder/columnorder?id=' + that.data.items.id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    });
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
      title: that.data.items.title,
      path: '/pages/column/column?id=' + that.data.items.id,
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
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
  //打卡日历
  calendar: function () {
    var that = this;
    wx.navigateTo({
      url: '../datepicker/datepicker?id=' + that.data.column_id,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    var columnid = that.data.column_id;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_info", { column_id: columnid}, function (res) {
      that.setData({
        items: res.data.data,
      });
      if (res.data.data.is_buy == 1) {
        //如果已经购买过
        userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_new_class_list", { column_id: columnid }, function (res) {
          that.setData({
            column_new_class: res.data.data.class,
          });
        });

        userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_my_dialy", { column_id: columnid }, function (res) {
          that.setData({
            column_my_dialy: res.data.data,
          });
        });

        userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_lastcomment", { column_id: columnid }, function (res) {
          var _common_comment_list = res.data.data;
          if (_common_comment_list && _common_comment_list.length > 0) {
            for (let i = 0; i < _common_comment_list.length; i++) {
              if (_common_comment_list[i].audio) {
                //innerAudioContext.src = _common_comment_list[i].audio;
                // 音频播放进度更新
                _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
                _common_comment_list[i].process_time = '00:00';
                _common_comment_list[i].ap_progress = 0;
                _common_comment_list[i].playstate = 'pause';
                _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
              }

              // 如果回复里有音频
              if (_common_comment_list[i].reply_list && _common_comment_list[i].reply_list.length > 0) {
                let replylist = _common_comment_list[i].reply_list;
                for (var j = 0; j < replylist.length; j++) {
                  if (replylist[j].audio) {
                    replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                    replylist[j].reply_playstate = 'pause';
                    replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                  }
                }
              }
            }
            that.setData({
              common_comment_list: _common_comment_list
            })
            console.log(that.data.common_comment_list);
          }
        });
      }

      var article = res.data.data.content + '<p style="text-align:center;"><strong>订阅须知</strong></p>' + res.data.data.notice;
      WxParse.wxParse('article', 'html', article, that, 5);
      // var notice = res.data.data.notice;
      // WxParse.wxParse('notice', 'html', notice, that, 5);
      // wx.setNavigationBarTitle({ title: res.data.data.title });
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.setData({
      is_loadingmore: 1,
      loadingmore_text: '正在加载'
    });
    var score = 0;
    var commentlist = that.data.common_comment_list;
    if (commentlist.length > 0) {
      score = commentlist[commentlist.length - 1].score;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_lastcomment", { column_id: that.data.column_id, inf_id: score }, function (res) {
      if (res.data.data.length) {
        var _common_comment_list_ori = that.data.common_comment_list;
        var _common_comment_list = res.data.data;
        if (_common_comment_list && _common_comment_list.length > 0) {
          for (let i = 0; i < _common_comment_list.length; i++) {
            if (_common_comment_list[i].audio) {
              //innerAudioContext.src = _common_comment_list[i].audio;
              // 音频播放进度更新
              _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
              _common_comment_list[i].process_time = '00:00';
              _common_comment_list[i].ap_progress = 0;
              _common_comment_list[i].playstate = 'pause';
              _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
            }

            // 如果回复里有音频
            if (_common_comment_list[i].reply_list && _common_comment_list[i].reply_list.length > 0) {
              let replylist = _common_comment_list[i].reply_list;
              for (var j = 0; j < replylist.length; j++) {
                if (replylist[j].audio) {
                  replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                  replylist[j].reply_playstate = 'pause';
                  replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                }
              }
            }
            _common_comment_list_ori.push(_common_comment_list[i]);
          }
          that.setData({
            common_comment_list: _common_comment_list_ori
          })
          console.log(that.data.common_comment_list);
        }
      } else {
        that.setData({
          loadingmore_text: '没有更多了'
        });
      }
      setTimeout(function () {
        that.setData({
          is_loadingmore: 0
        });
      }, 3000);
    });
  },
  gotoDaka:function(e){
    console.log("gotoDaka");
    var that = this;
    let id = e.detail.value.id;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      wx.navigateTo({
        url: '../sectiondetail/sectiondetail?id=' + id,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      }) 
    });
  },
  clock:function(e){
    var that = this;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../sectiondetail/sectiondetail?id=' + id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })  
  },

  //立即购买 非0元课
  buycolumn: function (e) {
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk  }, function (res) {
      that.buy();
    });
  },

  //立即购买 0元课
  buyfreeclass: function (e) {
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk  }, function (res) {
      that.join();
    });
  },

  // 引导APP
  guideApp: function () {
    const that = this;
    that.setData({
      guideApp: 1
    })
  },

  closeguideApp: function () {
    const that = this;
    that.setData({
      guideApp: 0
    })
  },

  // 获取手机号回调函数
  redirectTocallback: function () {
    var that = this;
    // buyclass_type 1立即购买 2拼课购买 3 0元课购买
    if (that.buycolumn_type == 2) {
      wx.redirectTo({
        url: '../order/order?id=' + that.data.datas.classid + '&tjuid=' + that.data.tjuid,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      });
    } else if(that.buycolumn_type == 1) {
      wx.navigateBack({
        success:function(){
          that.joinfree();
        }
      })
    }
  },
}))  

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}
