// pages/addcomment/addcomment.js
const app = getApp()
const userApi = require('../../libraries/user.js')

// 录音
const recorderManager = wx.getRecorderManager();

// 播放
const innerAudioContext = wx.createInnerAudioContext();
var interval;
const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dynid:0,
    dynIndex: -1,
    to_user:'',
    comment_type:1,   //1 师说评论
    comment_img_url : [],
    comment_img_count : 0,
    comment_words_count : 0,
    const_com_text : '',
    uptoken: '',
    upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=',
    upload_picture_list: [],

    // 音频
    ap_progress: 0,
    duration: '600',
    state: 'stop',
    countDownMinute: '00',
    countDownSecond: '00',
    wave:'http://imgs.52jiaoshi.com/1530778469.png',
    start:'http://imgs.52jiaoshi.com/1530856019.png',
    beginaudio:0,
    complete_state:0,
    play_img:'http://imgs.52jiaoshi.com/1530841265.png',
    new_count:'',
    playstate:'pause',
    uptoken: '',
    src:'',
    process_time:'00:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.id){
      that.setData({ dynid: options.id});
    }
    if (options.index) {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面
      that.setData({
        dynIndex: options.index,
        to_user: prevPage.data.replay_to_user
      });
    }
    if (options.tp){
      that.setData({ comment_type: options.tp});
    }
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", {}, function (res) {
        console.log(res);
        that.setData({
          uptoken: res.data.data.uptoken,
          upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=' + res.data.data.uptoken
        });
      });
    })
  },

  textAreaInput: function (e) {
    this.setData({
      const_com_text: e.detail.value,
      comment_words_count: e.detail.value.length
    });
  },
  submitComment: function (e) {
    var that = this;
    var suburl = app.globalData.mainDomain + "Dynamic/comment_add";

    //先上报formid
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
    });
    
    if (that.data.comment_type == 1){
      //添加师说评论
      suburl = app.globalData.mainDomain + "Knowledge/user/comment_add";
    }
    //e.detail.formId
    if (e.detail.value.com_text != "" || that.data.comment_words_count) {
      wx.showLoading({
        title: '正在发送',
        mask: true,
      });
      var com_text = e.detail.value.com_text;

      //upload_picture_list 元素定义 path:本地路径 path_server:上传后的路径(上传回调处理)
      var upload_picture_list_ = [];
      if (that.data.comment_img_url.length > 0){
        for (var ii = 0; ii < that.data.comment_img_url.length; ii++) {
          upload_picture_list_.push({
            path: that.data.comment_img_url[ii] ,
            tp: 'img',
            dur: 0,
            upload_percent: 0,
            path_server: ''
          });
        }
      }
      if (that.data.src.length){
        upload_picture_list_.push({
          path: that.data.src,
          tp: 'audio',
          dur: that.data.audio_duration,
          upload_percent: 0,
          path_server: ''
        });
      }

      if (upload_picture_list_.length) {
        //上传图片和音频并且发送
        that.setData({
          upload_picture_list: upload_picture_list_,
        })
        
        var proc = 0;
        var total = upload_picture_list_.length;
        userApi.upload_file_server(that, that.data.upurl, upload_picture_list_, proc, total, function () {
          subComment_pic(suburl, that.data.dynid, that.data.dynIndex, com_text, that.data.upload_picture_list);
        });
      } else {
        //直接发送
        subComment(suburl, that.data.dynid, that.data.dynIndex, com_text, '','',0);
      }
    } else {
      console.log("showCmtImg");
      //底部按钮，只隐藏
      that.setData({
        showCmtImg: false
      });
    }
  },
  selectImg: function (e) {
    var that = this;
    var comment_img_url = that.data.comment_img_url;
    var comment_img_count = that.data.comment_img_count;
    if (comment_img_count < 3){
      wx.chooseImage({
        count: 3 - comment_img_count, // 默认9，这里显示一次选择相册的图片数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFiles = res.tempFiles
          //循环把图片加入上传列表
          for (var i in tempFiles) {
            comment_img_url.push(tempFiles[i].path);
            comment_img_count++;
          }
          that.setData({
            comment_img_url: comment_img_url,
            comment_img_count: comment_img_count
          });
        }
      });
    }else{
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '最多选择三张图片',
      })
    }
  },
  deleteImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    var comment_img_url = [];
    var comment_img_count = 0;
    for (var i = 0; i < that.data.comment_img_url.length;i++){
      if (i != index){
        comment_img_url.push(that.data.comment_img_url[i]);
        comment_img_count ++;
      }
    }
    this.setData({
      comment_img_url: comment_img_url,
      comment_img_count: comment_img_count
    });
  },

  beginaudio:function(){
    let that=this;
    that.setData({
      beginaudio:1
    })
  },
  closeaudio:function(){
    let that = this;
    recorderManager.stop();
    clearInterval(interval);
    that.setData({
      beginaudio: 0,
      src:'',
      countDownMinute:'00',
      countDownSecond:'00',
      wave:'http://imgs.52jiaoshi.com/1530778469.png',
      start: 'http://imgs.52jiaoshi.com/1530856019.png',
      state:'stop'
    })

  },
  deleteaudio:function(){
    let that = this;
    that.setData({
      complete_state:0,
      src: ''
    })
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

  cancelComment:function(e){
    wx.navigateBack({
      
    });
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

  // 开始录制
  start: function (e) {
    const that = this;
    if (that.data.state == 'stop') {
      that.setData({
        state: 'start',
        start: 'http://imgs.52jiaoshi.com/1530781409.png',
        wave:'http://imgs.52jiaoshi.com/1530781821.gif'
      })
      recorderManager.start(options);
      //时间统计
      var totalSecond = 0;
      interval = setInterval(function () {
        // 秒数  
        var second = totalSecond;

        // 分钟位  
        var min = Math.floor((second) / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;

        // 秒位  
        var sec = second - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;

        that.setData({
          totalSecond: totalSecond,
          countDownMinute: minStr,
          countDownSecond: secStr
        });
        totalSecond++;
        if (totalSecond < 0) {
          clearInterval(interval);
          //设置结束
          that.setData({
            totalSecond: totalSecond,
            countDownMinute: '00',
            countDownSecond: '00'
          });
        }
      }.bind(this), 1000);
    } else if (that.data.state == 'start') {
      recorderManager.pause();
      clearInterval(interval);
      that.setData({
        state: 'pause',
        start: 'http://imgs.52jiaoshi.com/1530781480.png',
        wave: 'http://imgs.52jiaoshi.com/1530778469.png'
      })
    } else if (that.data.state == 'pause'){
      recorderManager.resume();
      //时间统计
      console.log(that.data.totalSecond);
      var totalSecond = that.data.totalSecond;
      interval = setInterval(function () {
        // 秒数  
        var second = totalSecond;

        // 分钟位  
        var min = Math.floor((second) / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;

        // 秒位  
        var sec = second - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;

        that.setData({
          totalSecond: totalSecond,
          countDownMinute: minStr,
          countDownSecond: secStr
        });
        totalSecond++;
        if (totalSecond < 0) {
          clearInterval(interval);
          //设置结束
          that.setData({
            totalSecond: 0,
            countDownMinute: '00',
            countDownSecond: '00'
          });
        }
      }.bind(this), 1000);
      that.setData({
        state: 'resume',
        start: 'http://imgs.52jiaoshi.com/1530781409.png',
        wave: 'http://imgs.52jiaoshi.com/1530781821.gif'
      })
    } else if (that.data.state == 'resume'){
      recorderManager.pause();
      clearInterval(interval);
      that.setData({
        state: 'pause',
        start: 'http://imgs.52jiaoshi.com/1530781480.png',
        wave: 'http://imgs.52jiaoshi.com/1530778469.png'
      })
    }
  },

  // 停止
  stop: function (e) {
    const that = this;
    recorderManager.stop();
    clearInterval(interval);
    wx.showLoading({
      title: '录制完成'
    })
    recorderManager.onStop(function (res) {
      console.log(res);
      wx.hideLoading();
      let _new_count= formatTime(res.duration / 1000);
      that.setData({
        src: res.tempFilePath,
        audio_duration: res.duration,
        beginaudio:0,
        complete_state:1,
        new_count: _new_count,
        comment_words_count:1
      })

      innerAudioContext.src = res.tempFilePath;
      // 音频播放进度更新
      innerAudioContext.onTimeUpdate(function (res) {
        var currentTime = innerAudioContext.currentTime;
        var duration = innerAudioContext.duration;
        var progress = parseInt((currentTime / duration) * 100);
        that.setData({
          ap_progress: progress,
          process_time: formatTime(currentTime),
          duration: duration
        })
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
      
    });

  },

  //语音播放
  audioPlay: function (e) {
    var that = this;
    if (that.data.playstate == 'pause') {
      that.setData({
        play_img: 'http://imgs.52jiaoshi.com/1530856329.png',
        playstate: 'play'
      })
      innerAudioContext.play();

      interval = setInterval(function () {
        var progress = innerAudioContext.duration;
      }.bind(this), 1000);
      
    } else {
      that.setData({
        play_img: 'http://imgs.52jiaoshi.com/1530841265.png',
        playstate: 'pause'
      })
      innerAudioContext.pause();
      clearInterval(interval);
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
    innerAudioContext.seek(progress);
  },
})

// 上传图片和语音
function subComment_pic(suburl, dynid, dynIndex, com_text, upload_pic_list){
  var strImgUrl = "";
  var audioUrl = "";
  var audioDur = 0;
  for (var i = 0; i < upload_pic_list.length;i++){
    if (upload_pic_list[i].path_server != undefined && upload_pic_list[i].path_server != ""){
      if (upload_pic_list[i].tp == "img"){
        strImgUrl += (upload_pic_list[i].path_server + ",");
      }else{
        audioUrl = upload_pic_list[i].path_server;
        audioDur = upload_pic_list[i].dur;
      }
    }
  }
  if (strImgUrl.length){
    strImgUrl = strImgUrl.substring(0, strImgUrl.length - 1);
  }
  subComment(suburl, dynid, dynIndex, com_text, strImgUrl, audioUrl, audioDur);
}

function subComment(suburl, dynid, dynIndex, com_text, strImgUrl, url, duration){
  var pages = getCurrentPages();
  var currPage = pages[pages.length - 1];   //当前页面
  var prevPage = pages[pages.length - 2];  //上一个页面
  var columnPage = null;
  if (pages.length >= 3){
    var columnPage = pages[pages.length - 3];  //上一个页面
  }

  userApi.requestAppApi_POST(suburl,
  {
    class_id: dynid,
    content: com_text,
    images: strImgUrl,
    audio : url,       //音频url
    audio_duration: duration, //音频时长
    touid: dynIndex > -1 ? prevPage.data.const_reply_uid : 0,
    cid: dynIndex > -1 ? prevPage.data.const_comment_id : 0,
    reply_id: dynIndex > -1 ? prevPage.data.const_reply_id : 0
  }, function (res) {
    
    if (res.data.code != 200){
      wx.showModal({
        title: '错误',
        showCancel: false,
        content: res.data.msg,
      })
      return;
    }
    console.log('查看图片问题');
    console.log(res);
    //清空form
    if (dynIndex == -1){
      //评论一节课
      var commentlist = prevPage.data.common_comment_list;
      if (commentlist == undefined || commentlist.length == 0){
        commentlist = [];
      }
      var commenta = res.data.data.comment;
      commenta.new_audioduration = formatTime(commenta.audioduration/1000);
      commenta.id = commenta["comment_id"];
      commenta.reply_list = [];
      commenta.reply_num = 0;
      commenta.like_num = 0;
      commenta.isliked = 0;     
      commentlist.unshift(commenta);
      var comment_num = prevPage.data.classinfo.comment_num;
      prevPage.setData({
        common_comment_list: commentlist,
        'classinfo.comment_num': ++comment_num,
        clock_state: true,
        clock_type: 1,
        clock_dialy_num: res.data.data.dialy_num,
        clock_num: res.data.data.num,
        clock_title: res.data.data.title,
        clock_dialy_picture: res.data.data.dialy_picture
      });

      if (columnPage != null && columnPage.data.column_id && columnPage.data.column_new_class){
        //这里处理下栏目详情页的数据
        //统计信息
        columnPage.setData({
          'column_my_dialy.count': res.data.data.dialy_num,
          'column_my_dialy.bdcount': res.data.data.bd_dialy_num
        });
        
        //评论列表
        var dialy_num = columnPage.data.items.dialy_num + 1;
        var column_lastcomment = columnPage.data.common_comment_list;
        column_lastcomment.unshift(commenta);
        columnPage.setData({
          common_comment_list: column_lastcomment,
          'items.dialy_num': dialy_num
        });
        //已打卡、评论增加新的
        if (columnPage.data.column_new_class && columnPage.data.column_new_class.class && columnPage.data.column_new_class.class.id == dynid){
          columnPage.setData({
            'column_new_class.class.dialy_time': commenta["id"]
          });
        }
      }
    }else{
      //回复评论
      var commentlist = prevPage.data.common_comment_list;
      var commenta = res.data.data.comment;
      commenta["id"] = commenta["comment_id"];
      var reply_list = commentlist[prevPage.data.const_reply_pindex].reply_list;
      reply_list.unshift(commenta);
      var reply_num = commentlist[prevPage.data.const_reply_pindex].reply_num;
      var reply_list_str = 'common_comment_list[' + prevPage.data.const_reply_pindex + '].reply_list';
      var reply_num_str = 'common_comment_list[' + prevPage.data.const_reply_pindex + '].reply_num';
      prevPage.setData({
        const_reply_text: "",
        reply_words_count: 0,
        replay_to_user: "",
        [reply_list_str]: reply_list,
        [reply_num_str]: ++reply_num
      });
    }
    console.log('发表成功');
    //todo 提交到列表页
    wx.hideLoading();
    wx.navigateBack({
      
    });
  })
}

function initial(duration, that) {
  // 秒数  
  var second = duration;

  // 分钟位  
  var min = Math.floor((second) / 60);
  var minStr = min.toString();
  if (minStr.length == 1) minStr = '0' + minStr;

  // 秒位  
  var sec = second - min * 60;
  var secStr = sec.toString();
  if (secStr.length == 1) secStr = '0' + secStr;
  that.setData({
    play_countDownMinute: minStr,
    play_countDownSecond: secStr
  })
}

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}

