const app = getApp();
const userApi = require('../../libraries/user.js');
var px2rpx = 2, windowWidth = 375;
var interval;
const cmt_module_data = {
  cmtImages: [],
  const_reply_text: '',
  const_reply_id: 0,
  const_comment_id: 0,
  replay_words_count: 0,
  replay_to_user: '',
  const_reply_index: -1,
  const_reply_pindex: -1,
  const_reply_uid: 0,
  const_reply_classid:'',
  common_comment_list:[],
  pindex:-1,  //评论index值
  rindex:-1   //回复index值
};
const innerAudioContext = wx.createInnerAudioContext();
const cmt_module_config = {
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
      const_reply_pindex: e.currentTarget.dataset.index,
      const_reply_index: -1,
      const_reply_uid: e.currentTarget.dataset.uid,
      const_reply_classid: e.currentTarget.dataset.classid
    });
    
    if (app.globalData.nickname == '' || app.globalData.headimgurl == '') {
      wx.navigateTo({
        url: '../getuserinfo/getuserinfo?addcommentType=2',
      })
    } else {
      wx.navigateTo({
        url: '../addcomment/addcomment?id=' + e.currentTarget.dataset.classid + '&index=' + that.data.const_reply_pindex,
      })
    }
  },
  //获取昵称后去回复主评论
  redirectToComment: function () {
    var that = this;
    wx.redirectTo({
      url: '../addcomment/addcomment?id=' + that.data.const_reply_classid + '&index=' + that.data.const_reply_pindex,
    });
  },
  replyreply: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.cmtid,
      const_reply_pindex: e.currentTarget.dataset.pindex,
      const_reply_index: e.currentTarget.dataset.index,
      const_reply_uid: e.currentTarget.dataset.uid,
      const_reply_classid: e.currentTarget.dataset.classid
    });
    if (app.globalData.nickname == '' || app.globalData.headimgurl == ''){
      wx.navigateTo({
        url: '../getuserinfo/getuserinfo?addcommentType=3',
      }) 
    }else{
      wx.navigateTo({
        url: '../addcomment/addcomment?id=' + e.currentTarget.dataset.classid + '&index=' + that.data.const_reply_pindex,
      })
    }
    
  },
  //获取昵称后去回复子评论
  redirectToReplay: function () {
    var that = this;
    wx.redirectTo({
      url: '../addcomment/addcomment?id=' + that.data.const_reply_classid + '&index=' + that.data.const_reply_pindex,
    });
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
    var like_num = e.currentTarget.dataset.likenum;
    var index = e.currentTarget.dataset.index;
    var cid = e.currentTarget.dataset.id;
    var like_str = 'common_comment_list[' + index + '].isliked';
    var like_num_str = 'common_comment_list[' + index + '].like_num';
    var like_users_str = 'common_comment_list[' + index + '].like_users';
    var like_users = that.data.common_comment_list[index].like_users;
    if (like > 0) {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_del", { comment_id: cid }, function (res) {
        for (var jj = 0; jj < like_users.length; jj++) {
          if (like_users[jj].id == res.data.data.uid) {
            like_users.splice(jj, 1);
            break;
          }
        }
        that.setData({
          [like_str]: 0,
          [like_num_str]: --like_num,
          [like_users_str]: like_users
        });
      });
    } else {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_add", { comment_id: cid }, function (res) {
        like_users.push({
          id: res.data.data.uid,
          nk: app.globalData.nickname
        });
        that.setData({
          [like_str]: 1,
          [like_num_str]: ++like_num,
          [like_users_str]: like_users
        });
      });
    }
  },
  //评论语音播放
  audioPlay: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var time = parseInt(e.currentTarget.dataset.duration / 1000); 
    var _playstate = e.currentTarget.dataset.playstate; 

    if (_playstate == "pause"){
      //暂停状态，要播放
      if (innerAudioContext.paused == false) {
        //当前有在播放
        if (that.data.rindex != -1) {
          //播放的其它回复条目
          let reply_audio_btn = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_audio_btn';
          let reply_playstate = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_playstate';
          let reply_new_duration = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].new_duration';
          let reply_time = that.data.common_comment_list[that.data.pindex].reply_list[that.data.rindex].audio_duration;
          that.setData({
            [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
            [reply_playstate]: 'pause',
            [reply_new_duration]: formatTime(reply_time / 1000)
          });
        } else {
          //播放的其它评论条目
          let playstate1 = 'common_comment_list[' + that.data.pindex + '].playstate';
          let play_img1 = 'common_comment_list[' + that.data.pindex + '].play_img';
          let ap_progress1 = 'common_comment_list[' + that.data.pindex + '].ap_progress';
          let process_time1 = 'common_comment_list[' + that.data.pindex + '].process_time';
          that.setData({
            [ap_progress1]: 0,
            [process_time1]: '00:00',
            [play_img1]: 'http://imgs.52jiaoshi.com/1530841265.png',
            [playstate1]: 'pause'
          })
        }
        innerAudioContext.stop();
      }else{
        if (that.data.pindex != -1 && that.data.pindex != index){
          //播放的其它评论条目
          let playstate1 = 'common_comment_list[' + that.data.pindex + '].playstate';
          let play_img1 = 'common_comment_list[' + that.data.pindex + '].play_img';
          let ap_progress1 = 'common_comment_list[' + that.data.pindex + '].ap_progress';
          let process_time1 = 'common_comment_list[' + that.data.pindex + '].process_time';
          that.setData({
            [ap_progress1]: 0,
            [process_time1]: '00:00',
            [play_img1]: 'http://imgs.52jiaoshi.com/1530841265.png',
            [playstate1]: 'pause'
          })
        }
      }
      
      let playstate2 = 'common_comment_list[' + index + '].playstate';
      let play_img2 = 'common_comment_list[' + index + '].play_img';
      that.setData({
        pindex: index,
        rindex: -1,
        [playstate2]: 'play',
        [play_img2]: 'http://imgs.52jiaoshi.com/1530856329.png'
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
        let ap_progress3 = 'common_comment_list[' + index + '].ap_progress';
        let process_time3 = 'common_comment_list[' + index + '].process_time';

        that.setData({
          [ap_progress3]: progress,
          [process_time3]: formatTime(currentTime)
        })
      })

      innerAudioContext.onEnded(function (res) {
        console.log(res);
        let ap_progress4 = 'common_comment_list[' + index + '].ap_progress';
        let playstate4 = 'common_comment_list[' + index + '].playstate';
        let play_img4 = 'common_comment_list[' + index + '].play_img';
        let process_time4 = 'common_comment_list[' + index + '].process_time';
        console.log(process_time4);
        innerAudioContext.seek(0);
        that.setData({
          [ap_progress4]: 0,
          [process_time4]: '00:00',
          [play_img4]: 'http://imgs.52jiaoshi.com/1530841265.png',
          [playstate4]: 'pause',
          pindex: -1,
          rindex: -1
        })
      })
    }else{
      //播放状态，要暂停
      let playstate4 = 'common_comment_list[' + index + '].playstate';
      let play_img4 = 'common_comment_list[' + index + '].play_img';
      that.setData({
        [play_img4]: 'http://imgs.52jiaoshi.com/1530841265.png',
        [playstate4]: 'pause'
      })
      innerAudioContext.pause();
    }
  },

  //进度条拖动事件
  audiohandleTouchEnd: function (e) {
    // console.log(e);
    // var that = this;
    // var x = e.detail.value;
    // var time = e.currentTarget.dataset.time;
    // var index = e.currentTarget.dataset.index;

    // var progress = parseInt(time * x / 100);
    // that.setData({
    //   ap_progress: x
    // });
    // innerAudioContext.seek(progress);
  },

  // 播放回复音频
  playraudio:function(e){
    let that = this;
    let src = e.currentTarget.dataset.audio;
    let pindex = e.currentTarget.dataset.pindex;
    let index = e.currentTarget.dataset.index;
    let duration = e.currentTarget.dataset.duration;
    let _reply_playstate = e.currentTarget.dataset.playstate;

    if (_reply_playstate == "pause"){
      //要播放
      if (innerAudioContext.paused == false){
        //当前有在播放
        if (that.data.rindex != -1 && that.data.rindex != index){
          //播放的其它回复条目
          let reply_audio_btn = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_audio_btn';
          let reply_playstate = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_playstate';
          let reply_new_duration = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].new_duration';
          let reply_time = that.data.common_comment_list[that.data.pindex].reply_list[that.data.rindex].audio_duration;
          that.setData({
            [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
            [reply_playstate]: 'pause',
            [reply_new_duration]: formatTime(reply_time / 1000)
          });
        }else{
          //播放的其它评论条目
          let playstate1 = 'common_comment_list[' + that.data.pindex + '].playstate';
          let play_img1 = 'common_comment_list[' + that.data.pindex + '].play_img';
          let ap_progress1 = 'common_comment_list[' + that.data.pindex + '].ap_progress';
          let process_time1 = 'common_comment_list[' + that.data.pindex + '].process_time';
          that.setData({
            [ap_progress1]: 0,
            [process_time1]: '00:00',
            [play_img1]: 'http://imgs.52jiaoshi.com/1530841265.png',
            [playstate1]: 'pause'
          })
        }
        innerAudioContext.stop();
      }
      
      if (that.data.pindex != pindex || that.data.rindex != index){
        innerAudioContext.src = src;
      }
      innerAudioContext.play();
      let reply_audio_btn = 'common_comment_list[' + pindex + '].reply_list[' + index + '].reply_audio_btn';
      let reply_playstate = 'common_comment_list[' + pindex + '].reply_list[' + index + '].reply_playstate';
      that.setData({
        [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531102717.gif',
        [reply_playstate]: 'play',
        pindex:pindex,
        rindex:index
      })
    }else{
      //要暂停
      var reply_audio_btn = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_audio_btn';
      var reply_playstate = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].reply_playstate';
      let reply_new_duration = 'common_comment_list[' + that.data.pindex + '].reply_list[' + that.data.rindex + '].new_duration';
      let reply_time = that.data.common_comment_list[that.data.pindex].reply_list[that.data.rindex].audio_duration;
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

      let new_duration = 'common_comment_list[' + pindex + '].reply_list[' + index +'].new_duration';
     
      that.setData({
        [new_duration]: formatTime(currentTime),
      })
    })
    
    innerAudioContext.onEnded(function (res) {
      innerAudioContext.seek(0);
      var reply_audio_btn = 'common_comment_list[' + pindex + '].reply_list[' + index + '].reply_audio_btn';
      var reply_playstate = 'common_comment_list[' + pindex + '].reply_list[' + index + '].reply_playstate';
      that.setData({
        [reply_audio_btn]: 'http://imgs.52jiaoshi.com/1531100999.png',
        [reply_playstate]: 'pause',
        pindex: -1,
        rindex: -1
      })
    })

  }
}

function ext_comment_config(pageConfig){
  var pageData = pageConfig.data;
  if (pageData){
    pageData = Object.assign(cmt_module_data,pageData);
  }
  var newConfig = Object.assign(pageConfig, cmt_module_config);
  newConfig.data = pageData;
  return newConfig;
}

module.exports = {
  ext_comment_config: ext_comment_config
}

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}