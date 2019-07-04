// pages/regudetail/regudetail.js
var px2rpx = 2, windowWidth = 375;
const app = getApp()
const userApi = require('../../libraries/user.js')
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: [],
    fromcity:0,
    regudata:[],
    moreButtonsShow:0,
    filelistShow: 0,
    imageSize: [],
    cmtImageSize: [],
    showCmtImg: false,
    const_reply_text: '',
    replay_words_count: 0,
    replay_to_user: '',
    article:'',
    menus:[]
  },
  analyseText: function (text) {
    let child_title = {};
    child_title.name = 'span';
    let attrs = "";
    if (text.size != '14') {
      attrs += 'font-size:' + text.size + 'px;';
    }

    if (text.unl != 0) {
      //attrs += 'text-decoration:underline;';
      attrs += 'padding-bottom:1px;border-bottom:1px solid #ff4a4a;';
      attrs += 'color:#ff4a4a;';
    } else {
      if (text.color != '#000000') {
        attrs += 'color:' + text.color + ';';
      }
    }
    if (attrs != "") {
      child_title.attrs = { style: attrs };
    } else {
      child_title.attrs = {};
    }
    child_title.children = [];
    child_title.children.push({ type: 'text', text: text.content });
    return child_title;
  },
  analyseImg: function (img) {
    let child_title = {};
    child_title.name = 'img';
    child_title.attrs = {};
    child_title.attrs.src = img.src;
    child_title.attrs.style = "width:100%;";
    return child_title;
  },
  analyseBr: function () {
    let child_title = {};
    child_title.name = 'br';
    return child_title;
  },
  analyseOneNode: function (items) {
    let arr_title = [];
    if (!items || !items.length) return arr_title;
    for (var ii = 0; ii < items.length; ii++) {
      if (items[ii].type == 'txt') {
        arr_title.push(this.analyseText(items[ii]));
      } else if (items[ii].type == 'img') {
        arr_title.push(this.analyseImg(items[ii]));
      } else if (items[ii].type == 'br') {
        arr_title.push(this.analyseBr());
      }
    }
    return arr_title;
  },
  //展示一道题
  showQuestion: function (datas) {
    if (!datas) return;
    let that = this;
    var question = {};
    //题目题干
    //解析 
    question.content = this.analyseOneNode(datas);
    return question;
  },
  replayThisText: function (e) {
    console.log(e.currentTarget);
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname
    });
  },
  cancelReplayMask: function (e) {
    var that = this;
    that.setData({
      replay_to_user: ''
    });
  },
  textAreaInput: function (e) {
    this.setData({
      const_reply_text: e.detail.value,
      replay_words_count: e.detail.value.length
    });
  },
  submitReply: function (e) {
    var that = this;
    //e.detail.formId
    console.log(e);
    if (e.detail.value.replay_text != "") {
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
    const that = this;
    if (options.cityid){
      that.setData({
        fromcity: options.cityid
      });
    }
    var reguid;
    if (options.scene && options.scene != "") {
      let scene = decodeURIComponent(options.scene);
      reguid = scene;
    } else {
      reguid = options.id
    }
    if (reguid){
      userApi.xcx_login_new(1, 0, function () {
        that.setData({
          userInfo: {
            nickname: app.globalData.nickname,
            headimgurl: app.globalData.headimgurl,
          }
        });
        
        userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/reg_detail", { id: reguid }, function (res) {
          console.log(res.data.data.regu.content);
          var content = that.showQuestion(res.data.data.regu.content);
          console.log(content);
          that.setData({
            regudata: res.data.data.regu,
            menus: res.data.data.menus,
            content: content
          });
          
          wx.setNavigationBarTitle({ title: res.data.data.regu.title });
          // WxParse.wxParse('article', 'html', that.data.regudata.content, that, 5);
        });
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/incrliulan",{ id: reguid }, function (res) {
      });
    }else{
      wx.switchTab({
        url: '../reguprov/reguprov',
      })
    }
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
    wx.stopPullDownRefresh();
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
    var that = this;
    return {
      title: that.data.regudata.title,
      path: '/pages/regudetail/regudetail?id=' + that.data.regudata.id,
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
  openFile : function(e){
    wx.showLoading({
      title: '正在下载',
    })
    var uuu = app.globalData.mainDomain + 'Xcx/download_file?url=' + encodeURI(e.currentTarget.dataset.url);
    var ftype = e.currentTarget.dataset.type;
    wx.downloadFile({
      url: uuu,
      success: function (res) {
        var filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          fileType: ftype,
          success: function (res) {
            
          },
          fail:function(err){
            wx.showModal({
              title: '提示',
              content: err.errMsg,
            })
          }
        })
      },
      complete:function(res){
        wx.hideLoading();
      }
    })
  },
  changeMoreButtonShow : function(e){
    var ms = this.data.moreButtonsShow;
    this.setData({
      moreButtonsShow : !ms
    });
  },
  changeFilelistShow: function (e) {
    var ms = this.data.filelistShow;
    this.setData({
      filelistShow: !ms
    });
  },
  moreRegus : function(e){
    if (this.data.fromcity > 0){
      wx.navigateBack({});
    }else{
      app.globalData.reguCity = this.data.regudata.cityid;
      wx.switchTab({
        url: '../reguprov/reguprov'
      })
    }
  },
  gotoUrl : function(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  }
})