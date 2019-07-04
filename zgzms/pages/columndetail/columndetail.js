const app = getApp()
const userApi = require('../../libraries/user.js')
const backgroundAudioManager = wx.getBackgroundAudioManager();
var playList = [];
var status = ['play', 'pause']
var modes = ['loop', 'single']
make_looper(modes)
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,   
    real_src:'',
    time: '',
    poster: '',
    status: 'play',
    mode: 'loop',
    playing_src:'',
    loading: false,
    ap_progress: 0,
    process_time: '00:00',
    total_time: '00:00',
    flag: true,
    const_reply_text: '',
    replay_words_count: 0,
    replay_to_user: '', 
  },
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
  playItem: function (e) {
    if (this.data.mode === 'single') {
      this.setMode('loop')
    }
    var song = playList.current(e.currentTarget.dataset.src)
    this.setData({
      playing_src: song.src,
      name: song.songname,
    })
    this.play()
  },
  play_pause: function () {
    var that = this;
    if (that.data.status == 'play') {
      that.setData({
        status: 'pause'
      }, function () {
        that.play();
      })
    } else {
      that.setData({
        status: 'play'
      }, function () {
        that.pause();
      })
    }
  },
  next: function () {
    var that = this;
    var song = playList.next()
    that.setData({
      playing_src: song.src,
      name: song.name,
      status: 'pause'
    },function(){
      that.play();
    })
  },
  prev: function () {
    var song = playList.prev();
    var that = this;
    that.setData({
      playing_src: song.src,
      name: song.name,
      status: 'pause'
    },function(){
      that.play()
    })
  },
  play: function () {
    var that = this;
    var src = that.data.playing_src;
    if (that.data.real_src.indexOf(src) == -1 || that.data.real_src.indexOf("?") == -1){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Knowledge/index/get_source_url", { source_path: src }, function (res) {
        console.log(res);
        that.setData({
          real_src: res.data.data.source_path,
          playing_src: src,
          loading: true
        },function(){
          // that.audioCtx.play();
          //背景音乐播放
          backgroundAudioManager.title = that.data.name
          backgroundAudioManager.coverImgUrl = that.data.items[0].module_img
          backgroundAudioManager.src = res.data.data.source_path // 设置了 src 之后会自动播放
        });
      });
    }else{
      that.setData({
        loading: true
      }, function () {
        // that.audioCtx.play();
        backgroundAudioManager.play();
      })
    }
  },
  pause: function () {
    var that = this;
    //that.audioCtx.pause();
    backgroundAudioManager.pause();
  },
  switchMode: function () {
    var mode = modes.next()
    this.setMode(mode)
    this.play()
    this.setData({
      status: 'pause'
    })
  },
  setMode: function (mode) {
    var that = this;
    if (mode === 'loop') {
      playList = that.data.playlist
    } else if (mode === 'random') {
      playList = displayList.slice(0).sort(function () {
        return Math.random() > 0.5 ? 1 : -1
      })
    } else if (mode === 'single') {
      playList = [playList.current(that.data.playing_src)]
    }
    make_looper(playList, setCurrent)
    this.setData({
      mode: mode
    })
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;

    /** 
    * 获取系统信息 
    */
    that.setData({
      winWidth: app.globalData.systemInfo.windowWidth,
      winHeight: app.globalData.systemInfo.windowHeight
    });  

    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "/index.php/Knowledge/index/column_classes", { column_id: params.id}, function (res) {
        //console.log(res.data.data);
        var datas = res.data.data.module_list;

        // var s = res.data.data.time_long;
        // var time_long = Math.floor(s / 60) + ':' + (s - Math.floor(s / 60) * 60);
        // var _size = res.data.data.size;
        // var size = (_size / 1024 / 1024).toFixed(2);
        for(var i= 0; i<datas.length ; i++){
          if(i == 0){
            datas[i].show = 1;  
            datas[i].show1 = 1; 
          }else{
            datas[i].show = 0;
            datas[i].show1 = 0;
          } 

          //订阅量
          if (datas[i].view_num > 10000){
            var num = '';
            num = datas[i].view_num/10000;
            datas[i].view_num = parseFloat(num).toFixed(1);
          }
          for (var j = 0; j < datas[i].class_list.length; j++) {
            //时长
            var s = datas[i].class_list[j].time_long;
            datas[i].class_list[j].time_long = formatTime(s);

            //文件大小
            var _size = datas[i].class_list[j].size;
            datas[i].class_list[j].size = (_size / 1024 / 1024).toFixed(2);

            //记录点击播放
            datas[i].class_list[j].play_flag = 0;

            //创建播放列表
            var json = {};
            json.name = datas[i].class_list[j].title;
            json.src = datas[i].class_list[j].source_path;

            playList.push(json);
          }
        }
        // console.log(playList);
        make_looper(playList, setCurrent);
        that.setData({
          items: datas,
          playlist: playList,
          playing_src: playList[0].src,
          name: playList[0].name
        });
      });  
    });

    // 音频正常播放
    backgroundAudioManager.onPlay(function (res) {
      that.setData({
        loading: false
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
  },
  onReady: function (res) {
    var that = this;
    //that.audioCtx = wx.createAudioContext('myAudio');
    backgroundAudioManager.onPrev(function(res){
      that.prev();
    });
    backgroundAudioManager.onNext(function (res) {
      that.next();
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    that.timer();  
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
      title: '推荐给你' + that.data.items.classname,
      path: '/pages/classx/classx?id=' + that.data.classid,
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

  //点击展开
  open:function(e){
    var that=this;
    var index = e.currentTarget.dataset.index;
    var datas = that.data.items;
    for(var i=0;i<datas.length; i++){
      if(i == index){
        datas[i].show = 1;
      }
    }
    that.setData({
      items:datas
    });
  },

  //点击收起
  close:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var datas = that.data.items;
    for (var i = 0; i < datas.length; i++) {
      if (i == index) {
        datas[i].show = 0;
      }
    }
    that.setData({
      items: datas
    });  
  },

  //连续听展开
  openall:function(e){
    console.log(1);
    var that = this;
    var index = e.currentTarget.dataset.index;
    var datas = that.data.items;
    for (var i = 0; i < datas.length; i++) {
      if (i == index) {
        datas[i].show1 = 1;
      }
    }
    that.setData({
      items: datas
    });  
  },

  //连续听展开
  closeall: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var datas = that.data.items;
    for (var i = 0; i < datas.length; i++) {
      if (i == index) {
        datas[i].show1 = 0;
      }
    }
    that.setData({
      items: datas,
    });
  },

  //点击播放
  player:function(e){
    var that = this;
    var name = e.currentTarget.dataset.name;  
    var flag = e.currentTarget.dataset.play_flag;
    console.log(name);
    for(var i=0;i<playList.length;i++){
      if (playList[i].name == name){
        that.setData({
          playing_src: playList[i].src,
          status: 'pause'
        },function(){
          that.play();
        })   
      }
    }

    var datalist = that.data.items;
    for (var i = 0; i < datalist.length;i++){
      for (var j = 0; j < datalist[i].class_list.length;j++){
        if (datalist[i].class_list[j].title == name){
          datalist[i].class_list[j].play_flag = 1;
        }else{
          datalist[i].class_list[j].play_flag = 0;
        }
      }
    }
    that.setData({
      items: datalist,
    });
  },

  //点击暂停
  pause_1: function (e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var flag = e.currentTarget.dataset.play_flag;
    console.log(name);
    for (var i = 0; i < playList.length; i++) {
      if (playList[i].name == name) {
        that.setData({
          playing_src: playList[i].src,
          status: 'play'
        }, function () {
          that.pause();
        })
      }
    }

    var datalist = that.data.items;
    for (var i = 0; i < datalist.length; i++) {
      for (var j = 0; j < datalist[i].class_list.length; j++) {
        if (datalist[i].class_list[j].title == name) {
          datalist[i].class_list[j].play_flag = 0;
        } else {
          datalist[i].class_list[j].play_flag = 0;
        }
      }
    }
    that.setData({
      items: datalist,
    });
  },

  // 音频调整位置
  seek:function(e){
    console.log(e);
    var that = this;
    var position = e.detail.x
    //that.audioCtx.seek(position);
  },

  //进度条拖动事件
  handleTouchEnd:function(e){
    console.log(e);
    var that = this;
    var x = e.detail.value;
    var time = e.currentTarget.dataset.time;
    var progress = parseInt(time * x / 100);
    that.setData({
      ap_progress: x
    });
    backgroundAudioManager.seek(progress);
    //that.audioCtx.seek(progress);
  },

  // 小程序退出记录播放状态
  timer: function (e) {
    const that = this;
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var x = parseInt(res.currentPosition / res.duration * 100)
        if (res.status == 1) {
          // console.log(res.currentPosition);
          // console.log(x);
          that.setData({
            status: 'pause',
            ap_progress: x,
            real_src: res.dataUrl,
            process_time: formatTime(res.currentPosition),
          });
        }
      }
    });
    
  }
})  


//连续音频播放部分代码
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