const app = getApp();
const userApi = require('../../libraries/user.js');
var px2rpx = 2, windowWidth = 375;

// 播放
const innerAudioContext = wx.createInnerAudioContext();
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    // tab切换  
    nickname:'',
    headimgurl:'',
    commentid:0,
    items: [] ,
    is_loadingmore: 0,
    loadingmore_text: '正在加载',
    indicatorDots: false,

    //以下都是评论相关的内容
    cmtImages: [],
    const_reply_text: '',
    const_reply_id: 0,
    const_comment_id: 0,
    replay_words_count: 0,
    replay_to_user: '',
    const_reply_index: -1,
    const_reply_pindex: -1,
    const_reply_uid: 0,
    rindex: -1   //回复index值
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    var commentid = params.id;
    // var commentid = 59652;
    // var commentid = 249437;
    that.setData({
      commentid: commentid
    });
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/user/comment", { id: commentid}, function (res) {
        that.setData({
          items: res.data.data,
        });
        
        var _common_comment_list = that.data.items;
        //判断列表中是否有音频文件存在
        if (_common_comment_list.audio) {
          innerAudioContext.src = _common_comment_list.audio;
          // 音频播放进度更新

          _common_comment_list.new_duration = formatTime(_common_comment_list.audio_duration / 1000);
          _common_comment_list.process_time = '00:00';
          _common_comment_list.ap_progress = 0;
          _common_comment_list.playstate = 'pause';
          _common_comment_list.play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
          that.setData({
            items: _common_comment_list
          })

        }
        // 如果回复里有音频
        if (_common_comment_list.reply_list && _common_comment_list.reply_list.length > 0) {
          let replylist = _common_comment_list.reply_list;
          for (var j = 0; j < replylist.length; j++) {
            if (replylist[j].audio) {
              replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
              replylist[j].reply_playstate = 'pause';
              replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
              that.setData({
                items: _common_comment_list
              })
            }
          }
        }
        console.log(that.data.items);

      });
    });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
      path: '/pages/clockdiaries/clockdiaries?id=' + that.data.commentid,
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  clock:function(e){
    wx.navigateTo({
      url: '../column/column?id=' + e.currentTarget.dataset.id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })  
  },
  //这里开始是评论功能
  viewUserDetail: function (e) {
    // if (e.currentTarget.dataset.type != 2){
    wx.navigateTo({
      url: '../user/user?id=' + e.currentTarget.dataset.userid,
    })
    // }
  },
  replycomment: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.cmtid,
      const_reply_pindex: -1,
      const_reply_index: -1,
      const_reply_uid: e.currentTarget.dataset.uid
    });
    wx.navigateTo({
      url: './diariescomment?id=' + e.currentTarget.dataset.classid + '&index=-1',
    })
  },
  replyreply: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.cmtid,
      const_reply_pindex: e.currentTarget.dataset.pindex,
      const_reply_index: e.currentTarget.dataset.index,
      const_reply_uid: e.currentTarget.dataset.uid
    });
    wx.navigateTo({
      url: './diariescomment?id=' + e.currentTarget.dataset.classid + '&index=' + e.currentTarget.dataset.pindex,
    })
  },
  cmtImageLoad: function (e) {
    //单位rpx
    var originWidth = e.detail.width * px2rpx,
      originHeight = e.detail.height * px2rpx,
      ratio = originWidth / originHeight;
    var viewWidth = 710, viewHeight; //设定一个初始宽度
    //当它的宽度大于初始宽度时，实际效果跟mode=widthFix一致
    if (originWidth >= viewWidth) {
      //宽度等于viewWidth,只需要求出高度就能实现自适应
      viewHeight = viewWidth / ratio;
    } else {
      //如果宽度小于初始值，这时就不要缩放了
      viewWidth = originWidth;
      viewHeight = originHeight;
    }

    var cmtImages = this.data.cmtImages;
    if (!cmtImages[e.currentTarget.dataset.pid]) {
      cmtImages[e.currentTarget.dataset.pid] = [];
    }
    cmtImages[e.currentTarget.dataset.pid].push(e.currentTarget.dataset.ori);

    this.setData({
      cmtImages: cmtImages
    })
  },
  clickCmtImage: function (e) {
    var that = this;
    var images = that.data.cmtImages[e.currentTarget.dataset.pid];
    var current = e.currentTarget.dataset.ori;
    wx.previewImage({
      current: current,
      urls: images,//内部的地址为绝对路径
      fail: function () {
      },
      complete: function () {
      },
    })
  },
  dianzanComment: function (e) {
    var that = this;
    var like = e.currentTarget.dataset.like;
    var cid = e.currentTarget.dataset.id;
    var like_users = that.data.items.like_users;

    if (like > 0) {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_del", { comment_id: cid }, function (res) {
        for (var jj = 0; jj < like_users.length; jj++) {
          if (like_users[jj].id == res.data.data.uid) {
            like_users.splice(jj, 1);
            break;
          }
        }
        that.setData({
          'items.isliked': 0,
          'items.like_users': like_users
        });
      });
    } else {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_add", { comment_id: cid }, function (res) {
        like_users.push({
          id: res.data.data.uid,
          nk: app.globalData.nickname,
          img: app.globalData.headimgurl
        });
        that.setData({
          'items.isliked': 1,
          'items.like_users': like_users
        });
      });
    }
  },

  home:function(e){
    wx.switchTab({
      url: '../home/home',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  //评论语音播放
  audioPlay: function (e) {
    var that = this;
    var time = parseInt(e.currentTarget.dataset.duration / 1000);
    var _playstate = e.currentTarget.dataset.playstate;
    var _items = that.data.items;
    if (_playstate == "pause") {
      if (that.data.rindex != -1) {
        //播放的其它回复条目
        let reply_audio_btn = 'items.reply_list[' + that.data.rindex + '].reply_audio_btn';
        let reply_playstate = 'items.reply_list[' + that.data.rindex + '].reply_playstate';
        let reply_new_duration = 'items.reply_list[' + that.data.rindex + '].new_duration';
        let reply_time = that.data.items.reply_list[that.data.rindex].audio_duration;
        that.setData({
          [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
          [reply_playstate]: 'pause',
          [reply_new_duration]: formatTime(reply_time / 1000)
        });
        innerAudioContext.stop();
      }

      //暂停状态，要播放
      that.setData({
        ['items.playstate']: 'play',
        ['items.play_img']: 'http://imgs.52jiaoshi.com/1530856329.png',
        rindex: -1
      });
      
      innerAudioContext.src = e.currentTarget.dataset.audio;
      innerAudioContext.play();

      innerAudioContext.onPlay(function (res) {
        //console.log("play");
      });

      // 音频播放进度更新
      innerAudioContext.onTimeUpdate(function (res) {
        let currentTime = innerAudioContext.currentTime;
        console.log(currentTime);
        let duration = time;
        let progress = parseInt((currentTime / duration) * 100);
        that.setData({
          ['items.ap_progress']: progress,
          ['items.process_time']: formatTime(currentTime)
        })
      })

      innerAudioContext.onEnded(function (res) {
        innerAudioContext.seek(0);
        that.setData({
          ['items.ap_progress']: 0,
          ['items.process_time']: '00:00',
          ['items.playstate']: 'pause',
          ['items.play_img']: 'http://imgs.52jiaoshi.com/1530841265.png'
        })
      })
    } else {
      //播放状态，要暂停
      that.setData({
        ['items.playstate']: 'pause',
        ['items.play_img']: 'http://imgs.52jiaoshi.com/1530841265.png'
      })
      innerAudioContext.pause();
    }
  },

  // 播放回复音频
  playraudio: function (e) {
    let that = this;
    let src = e.currentTarget.dataset.audio;
    let index = e.currentTarget.dataset.index;
    let duration = e.currentTarget.dataset.duration;
    let _reply_playstate = e.currentTarget.dataset.playstate;

    if (_reply_playstate == "pause") {
      //要播放
      if (innerAudioContext.paused == false) {
        //当前有在播放
        if (that.data.rindex != -1) {
          //播放的其它回复条目
          let reply_audio_btn = 'items.reply_list[' + that.data.rindex + '].reply_audio_btn';
          let reply_playstate = 'items.reply_list[' + that.data.rindex + '].reply_playstate';
          let reply_new_duration = 'items.reply_list[' + that.data.rindex + '].new_duration';
          let reply_time = that.data.items.reply_list[that.data.rindex].audio_duration;
          that.setData({
            [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
            [reply_playstate]: 'pause',
            [reply_new_duration]: formatTime(reply_time / 1000)
          });
        }else{
          that.setData({
            ['items.ap_progress']: 0,
            ['items.process_time']: '00:00',
            ['items.playstate']: 'pause',
            ['items.play_img']: 'http://imgs.52jiaoshi.com/1530841265.png'
          })
        } 
        innerAudioContext.stop();
      }

      if (that.data.rindex != index) {
        innerAudioContext.src = src;
      }
      innerAudioContext.play();
      let reply_audio_btn = 'items.reply_list[' + index + '].reply_audio_btn';
      let reply_playstate = 'items.reply_list[' + index + '].reply_playstate';
      that.setData({
        [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531102717.gif',
        [reply_playstate]: 'play',
        rindex: index
      })
    } else {
      //要暂停
      var reply_audio_btn = 'items.reply_list[' + that.data.rindex + '].reply_audio_btn';
      var reply_playstate = 'items.reply_list[' + that.data.rindex + '].reply_playstate';
      let reply_new_duration = 'items.reply_list[' + that.data.rindex + '].new_duration';
      let reply_time = that.data.items.reply_list[that.data.rindex].audio_duration;
      innerAudioContext.pause();
      that.setData({
        [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
        [reply_playstate]: 'pause'
      })
    }

    innerAudioContext.onPlay(function (res) {
      //console.log("play");
    });
    // 音频播放进度更新
    innerAudioContext.onTimeUpdate(function (res) {
      let currentTime = innerAudioContext.currentTime;

      let new_duration = 'items.reply_list[' + index + '].new_duration';

      that.setData({
        [new_duration]: formatTime(currentTime),
      })
    })

    innerAudioContext.onEnded(function (res) {
      innerAudioContext.seek(0);
      var reply_audio_btn = 'items.reply_list[' + index + '].reply_audio_btn';
      var reply_playstate = 'items.reply_list[' + index + '].reply_playstate';
      that.setData({
        [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
        [reply_playstate]: 'pause',
        rindex: -1
      })
    })

  }
})
function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}