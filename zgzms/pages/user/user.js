const app = getApp();
const userApi = require('../../libraries/user.js');
var utilComment = require('../common/commentlist.js');
var px2rpx = 2, windowWidth = 375;

// 语音播放
const innerAudioContext = wx.createInnerAudioContext();

// 创建一个页面对象用于控制页面的逻辑
Page(utilComment.ext_comment_config({
  data: {
    // tab切换  
    nickname:'',
    headimgurl:'',
    userid:0,
    common_comment_list:[],
    items: [] ,
    is_loadingmore: 0,
    loadingmore_text: '正在加载',
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    var userid = params.id;
    that.setData({
      userid: params.id
    });
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/dialystats", { userid: userid}, function (res) {
        that.setData({
          items: res.data.data,
        });
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/dialylist", { userid: userid}, function (res) {
        that.setData({
          dialylist: res.data.data,
        });
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/cmtlist", { userid: userid}, function (res) {
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
    });
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
      path: '/pages/user/user?id=' + that.data.userid,
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/cmtlist", {}, function (res) {
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
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/cmtlist", {inf_id: score }, function (res) {
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
  clock:function(e){
    wx.navigateTo({
      url: '../column/column?id=' + e.currentTarget.dataset.id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })  
  }
})) 

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
} 
