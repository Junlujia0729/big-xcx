const app = getApp();
const userApi = require('../../libraries/user.js');
var utilComment = require('../common/commentlist.js');
var WxParse= require('../../wxParse/wxParse.js');
var px2rpx = 2, windowWidth = 375;

const backgroundAudioManager = wx.getBackgroundAudioManager();
// 播放
const innerAudioContext = wx.createInnerAudioContext();
// 创建一个页面对象用于控制页面的逻辑
Page(utilComment.ext_comment_config({
  data: {
    // tab切换  
    classid: 0,
    classinfo: [] ,
    items:[],
    common_comment_list:[],
    last_comment_id:0,
    src: '',
    time: '',
    poster: '',
    status: 'play',
    mode: 'loop',
    loading: false,
    ap_progress: 0,
    process_time: '00:00',
    total_time: '00:00',
    flag :true,
    imageSize: [],
    is_loadingmore:0,
    loadingmore_text:'正在加载',
    clock_state:false,
    clock_type:0,
    clock_dialy_num:0,
    clock_num: 0,
    clock_title:'',
    clock_nickname:'',
    clock_headimgurl:'',
    clock_day:'',
    clock_dialy_picture:'',

    // 音频
    play_img: 'http://imgs.52jiaoshi.com/1530841265.png',
    new_count: '',
    playstate: 'pause',
    uptoken: '',
    src: '',
    process_time: '00:00',
    reply_audio_btn: 'http://imgs.52jiaoshi.com/1531100999.png'
  },
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    //this.audioCtx = wx.createAudioContext('myAudio');
  },
  scrollToLastComment:function(){
    wx.createSelectorQuery().select('#section_content_box').boundingClientRect(function (rect) {
      // rect.id      // 节点的ID
      // rect.dataset // 节点的dataset
      // rect.left    // 节点的左边界坐标
      // rect.right   // 节点的右边界坐标
      // rect.top     // 节点的上边界坐标
      // rect.bottom  // 节点的下边界坐标
      // rect.width   // 节点的宽度
      // rect.height  // 节点的高度
      //console.log(rect);
      if (rect && rect.height){
        wx.pageScrollTo({
          scrollTop: rect.height,
        })
      }
    }).exec();
  },
  // 音频
  started: function () {
    console.log("started");
    this.setData({
      loading: false
    })
  },
  ended: function () {
    this.next()
  },
  timeupdate: function (e) {
    var currentTime = e.detail.currentTime;
    var duration = e.detail.duration;
    var progress = parseInt((e.detail.currentTime / e.detail.duration) * 100);
    this.setData({
      ap_progress: progress,
      process_time: formatTime(currentTime),
      total_time: formatTime(duration),
      time: formatTime(duration - currentTime),
      duration: duration
    })
  },

  play_pause: function(e) {
    var that = this;
    if (that.data.status == 'play') {
      that.setData({
        status: 'pause'
      },function(){
        that.play();
      })
    } else {
      that.setData({
        status: 'play'
      },function(){
        that.pause();
      })
    }
  },
  next: function () {
    wx.showToast({
      title: '已经是最后一首',
      duration: 1500
    })
  },
  prev: function () {
    wx.showToast({
      title: '已经是第一首',
      duration: 1500
    })
  },
  play: function () {
    var that =this;
    var src = that.data.src;
    loading: true;
    if (that.data.src.indexOf("?") == -1) {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/get_source_url", { source_path: that.data.source_path }, function (res) {
        // console.log(res.data.data.source_path);
        that.setData({
          src: res.data.data.source_path,
          loading: true
        },function(){
          // that.audioCtx.play();
          //背景音乐播放
          backgroundAudioManager.title = that.data.classinfo.title
          backgroundAudioManager.coverImgUrl = that.data.classinfo.module_img
          backgroundAudioManager.src = res.data.data.source_path // 设置了 src 之后会自动播放          
        })
      });
    }else{
      that.setData({
        loading: true
      },function(){
        // that.audioCtx.play();
        backgroundAudioManager.play();
      });
    }
  },
  
  pause: function () {
    var that = this;
    //that.audioCtx.pause();
    backgroundAudioManager.pause();
  },
  // switchMode: function () {
  //   var mode = modes.next()
  //   this.setMode(mode)
  //   this.play()
  // },
  

  onLoad(params) {
    console.log('onload');
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    // var classid = 391;
    var classid = params.id;
    const that = this;
    that.setData({
      classid: classid
    }); 

    // 音频正常播放
    backgroundAudioManager.onPlay(function (res) {
      that.setData({
        loading: false,
        play_status: true,
        status: 'pause'
      })
    });
    // 音频播放进度更新
    backgroundAudioManager.onTimeUpdate(function (res) {
      var currentTime = backgroundAudioManager.currentTime;
      var duration = backgroundAudioManager.duration;
      var progress = parseInt((currentTime / duration) * 100);
      that.setData({
        ap_progress: progress,
        process_time: formatTime(currentTime),
        total_time: formatTime(duration),
        time: formatTime(duration - currentTime),
        duration: duration
      })
    })
    
    userApi.xcx_login_new(1,0,function () {
      that.setData({
        clock_nickname: app.globalData.nickname,
        clock_headimgurl: app.globalData.headimgurl
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/class_info", { class_id: classid}, function (res) {
        var _size = res.data.data.size;
        var size = (_size / 1024 / 1024).toFixed(2);
        //console.log(res.data.data);
        that.setData({
          classinfo: res.data.data,
          clock_type: res.data.data.dialy_time && res.data.data.dialy_time > 0 ? 2 : 0,
          items: { is_buy: res.data.data.is_buy, is_dialy_class: res.data.data.is_dialy_class,price: res.data.data.column_price, title: res.data.data.column_title },
          total_time: formatTime(res.data.data.time_long),
          size: size,
          source_path: res.data.data.source_path
        });
        var article = res.data.data.content; 
        WxParse.wxParse('article', 'html', article, that, 5);
        wx.setNavigationBarTitle({ title: res.data.data.title});
        if (backgroundAudioManager.src && 
        backgroundAudioManager.src.indexOf(that.data.source_path) == -1) {
          that.play();
        }
      });


      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/comment_list", { class_id: classid, inf_id:0 }, function (res) {
        console.log(res.data.data);
        that.setData({
          common_comment_list: res.data.data,
        });
        var _common_comment_list = that.data.common_comment_list;
        //判断列表中是否有音频文件存在
        if (that.data.common_comment_list && that.data.common_comment_list.length > 0) {
          for (let i = 0; i < that.data.common_comment_list.length; i++) {

            // 如果评论里有音频
            if (that.data.common_comment_list[i].audio) {
              innerAudioContext.src = that.data.common_comment_list[i].audio;
              // 音频播放进度更新
              _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
              _common_comment_list[i].process_time = '00:00';
              _common_comment_list[i].ap_progress = 0;
              _common_comment_list[i].playstate = 'pause';
              _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
              that.setData({
                common_comment_list: _common_comment_list
              })
            }

            // 如果回复里有音频
            if (that.data.common_comment_list[i].reply_list && that.data.common_comment_list[i].reply_list.length > 0){
              let replylist = _common_comment_list[i].reply_list;
              for (var j = 0; j < replylist.length;j++){
                if (replylist[j].audio){
                  replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                  replylist[j].reply_playstate = 'pause';
                  replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                  that.setData({
                    common_comment_list: _common_comment_list
                  })  
                }
              }
            }
          }
          console.log(that.data.common_comment_list);
        }
      });
    });
    
    var myDate = new Date();
    var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var month = myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
    var day = myDate.getDate();        //获取当前日(1-31)

    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
      day = "0" + day;
    }
    var clock_day = year + '-' + month + '-' + day
    that.setData({
      clock_day: clock_day
    })


    
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
    const that = this;
    // console.log(that.data.clock_state);  
    that.timer();

    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/comment_list", { class_id: that.data.classid, inf_id: 0 }, function (res) {
      //判断列表中是否有音频文件存在
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
  },


  //立即购买
  buy:function(){
    var that = this;
    if (!userApi.xcx_check_mobile_empty()) {
      return;
    }
    wx.navigateTo({
      url: '../columnorder/columnorder?id=' + that.data.classinfo.column_id,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    });
  },
  // 获取手机号回调
  redirectTocallback: function () {
    var that = this;
    wx.redirectTo({
      url: '../columnorder/columnorder?id=' + that.data.classinfo.column_id,
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
      title: that.data.classinfo.title,
      path: '/pages/sectiondetail/sectiondetail?id=' + that.data.classinfo.id,
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
    const that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/comment_list", { class_id: that.data.classid, inf_id: 0 }, function (res) {
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
  viewUserDetail: function (e) {
    // if (e.currentTarget.dataset.type != 2) {
      wx.navigateTo({
        url: '../user/user?id=' + e.currentTarget.dataset.userid,
      })
    // }
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
    var common_comment_list = that.data.common_comment_list;
    if (common_comment_list.length > 0){
      score = common_comment_list[common_comment_list.length - 1].score;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/comment_list", { class_id: that.data.classid, inf_id: score }, function (res) {
      if (res.data.data.length){
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
      }else{
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
  commentClass:function(e){
    var that = this;
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
      if (app.globalData.nickname == '' || app.globalData.headimgurl == '') {
        wx.navigateTo({
          url: '../getuserinfo/getuserinfo?addcommentType=1',
        })
      } else {
        wx.navigateTo({
          url: '../addcomment/addcomment?id=' + that.data.classid,
        })
      }
      
    });
  },
  //获取昵称后打卡
  redirectToAdd: function () {
    var that = this;
    wx.redirectTo({
      url: '../addcomment/addcomment?id=' + that.data.classid,
    });
  },
  dianzanClass:function(e){
    var that = this;
    var like_num = that.data.classinfo.like_num;

    if (that.data.classinfo.like_status > 0){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/class_like_del",{class_id: that.data.classid}, function (res) {
        that.setData({
          'classinfo.like_status' : 0,
          'classinfo.like_num': --like_num,
        });
      });
    }else{
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/class_like_add", { class_id: that.data.classid }, function (res) {
        that.setData({
          'classinfo.like_status': 1,
          'classinfo.like_num': ++like_num,
        });
      });
    }
  },

  //进度条拖动事件
  handleTouchEnd: function (e) {
    console.log(e);
    var that = this;
    var x = e.detail.value;
    var time = e.currentTarget.dataset.time;
    
    var progress = parseInt(time * x / 100);
    that.setData({
      ap_progress: x
    });
    backgroundAudioManager.seek(progress);
    // that.audioCtx.seek(progress);
  },
  close:function(){
    const that = this;
    that.setData({
      clock_state :false,
      clock_type:2
    });
    that.scrollToLastComment();
  },
  imageDown: function (e) {
    var that = this;
    var fileimg = '';
    wx.showLoading({
      title: '正在下载',
    });
    wx.downloadFile({
      url: app.globalData.mainDomain + "Knowledge/user/download_share_pic?id=" + that.data.classinfo.column_id + '&token=' + app.globalData.userToken, //仅为示例，并非真实的资源
      success: function (res) {
        wx.hideLoading();
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        fileimg = res.tempFilePath;
        wx.getSetting({
          success(ss) {
            if (!ss.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                  wx.saveImageToPhotosAlbum({
                    filePath: fileimg,
                    success(ires) {
                      wx.showModal({
                        title: '提示',
                        content: '保存成功，赶快晒朋友圈吧！',
                        showCancel: false
                      })
                    }
                  })
                }
              })
            } else {
              wx.saveImageToPhotosAlbum({
                filePath: fileimg,
                success(ires) {
                  wx.showModal({
                    title: '提示',
                    content: '保存成功，赶快晒朋友圈吧！',
                    showCancel: false
                  })
                }
              })
            }
          }
        })
      },fail: function(){
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          showCancel:false,
          content: '下载图片失败',
        })
      }
    })
  },

  timer:function(e){
    const that = this;
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        // console.log(res);
        var x = parseInt(res.currentPosition / res.duration * 100)
        if (res.status == 1) {
          // console.log(res.currentPosition);
          // console.log(x);
          that.setData({
            status: 'pause',
            ap_progress: x,
            src: res.dataUrl,
            process_time: formatTime(res.currentPosition),
          });
        }
      }
    });
  }
}))

function setCurrent(src) {
  var idx = 0
  this.forEach(function (item, index) {
    if (src === item.src) {
      return idx = index
    }
  })
  return idx
}

function make_looper(arr, setCurrent) {

  arr.loop_idx = 0

  arr.current = function (current) {
    if (current) {
      this.loop_idx = setCurrent.call(this, current)
    }
    if (this.loop_idx < 0) {
      this.loop_idx = this.length - 1
    }
    if (this.loop_idx >= this.length) {
      this.loop_idx = 0
    }
    return arr[this.loop_idx]
  }

  arr.next = function () {
    this.loop_idx++
    return this.current()
  }

  arr.prev = function () {
    this.loop_idx--
    return this.current()
  }
}

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}
