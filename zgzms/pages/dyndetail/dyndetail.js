// pages/dyndetail/dyndetail.js
var px2rpx = 2, windowWidth = 375;
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageSize: [],
    cmtImageSize : [],
    showCmtImg : false,
    const_reply_text:'',
    replay_words_count : 0,
    replay_to_user:'',
  },
  replayThisText : function(e){
    console.log(e.currentTarget);
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname
    });
  },
  cancelReplayMask:function(e){
    var that = this;
    that.setData({
      replay_to_user: ''
    });
  },
  textAreaInput : function(e){
    this.setData({
      const_reply_text: e.detail.value,
      replay_words_count : e.detail.value.length
    });
  },
  submitReply:function(e){
    var that = this;
    //e.detail.formId
    console.log(e);
    if (e.detail.value.replay_text != ""){
      wx.showLoading({
        title: '正在发送',
        mask: true,
      });
      var replay_text = e.detail.value.replay_text;
      console.log("comment_add 2222");
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Dynamic/comment_add", {
        content: com_text,
        images: '',
        dynid: 1,
        touid: 543273
      }, function (res) {
        //清空form
        wx.hideLoading();
        that.setData({
          const_reply_text: "",
          reply_words_count: 0
        });

        //todo 提交到列表页
      })
    }
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userApi.xcx_login_new(1, 0, function () {
    });
  },
  imageLoad: function (e) {
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
    var imageSize = this.data.imageSize;
    if (!imageSize[e.currentTarget.dataset.pindex] || imageSize[e.currentTarget.dataset.pindex] == undefined) {
      imageSize[e.currentTarget.dataset.pindex] = new Array();
    }
    imageSize[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index] = {
      width: viewWidth,
      height: viewHeight,
      url: e.currentTarget.dataset.src
    };
    this.setData({
      imageSize: imageSize
    })
  },
  clickImage: function (e) {
    var that = this;
    var current = that.data.imageSize[e.currentTarget.dataset.pindex][e.currentTarget.dataset.index].url;
    var urls = [];
    for (var i = 1; i <= that.data.imageSize[e.currentTarget.dataset.pindex].length; i++) {
      if (that.data.imageSize[e.currentTarget.dataset.pindex][i] && that.data.imageSize[e.currentTarget.dataset.pindex][i] != undefined) {
        urls.push(that.data.imageSize[e.currentTarget.dataset.pindex][i].url);
      }
    }
    wx.previewImage({
      current: current,
      urls: urls,//内部的地址为绝对路径
      fail: function () {
      },
      complete: function () {
      },
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
    var cmtImageSize = this.data.cmtImageSize;
    cmtImageSize[e.currentTarget.dataset.cmtid] = {
      width: viewWidth,
      height: viewHeight,
      url: e.currentTarget.dataset.src
    };
    this.setData({
      cmtImageSize: cmtImageSize
    })
  },
  clickCmtImage: function (e) {
    var that = this;
    var current = that.data.cmtImageSize[e.currentTarget.dataset.cmtid].url;
    var urls = [];
    urls.push(current);
    wx.previewImage({
      current: current,
      urls: urls,//内部的地址为绝对路径
      fail: function () {
      },
      complete: function () {
      },
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
  
  }
})