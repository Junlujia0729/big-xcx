// pages/commentdetail/commentdetail.js
const app = getApp()
const userApi = require('../../libraries/user.js')
var px2rpx = 2, windowWidth = 375;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentid:0,
    commentindex:-1,
    inf_id:0,
    item:[],
    replylist:[],
    cmtImageSize: [],
    const_reply_text: '',
    const_reply_id: 0,
    const_comment_id: 0,
    replay_words_count: 0,
    replay_to_user: '',
    const_reply_uid: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var commentid = 56427;
    // var commentindex = 1;
    var commentid = options.id;
    var commentindex = options.idx;
    const that = this;
    that.setData({
      commentid: commentid,
      commentindex: commentindex
    });

    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/Comment_info", { comment_id: commentid }, function (res) {
        that.setData({
          item: res.data.data
        });
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/Comment_index", { comment_id: commentid, inf_id: 0 }, function (res) {
        that.setData({
          replylist: res.data.data,
        });
      });
    });
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
    cmtImageSize[e.currentTarget.dataset.index] = {
      width: viewWidth,
      height: viewHeight,
      url: e.currentTarget.dataset.ori
    };
    this.setData({
      cmtImageSize: cmtImageSize
    })
  },
  clickCmtImage: function (e) {
    var that = this;
    var images = that.data.cmtImageSize;
    var current = images[e.currentTarget.dataset.index].url;
    var urls = [];
    for (var i = 0; i < images.length; i++) {
      urls.push(images[i].url);
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  //评论
  replycomment: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.id,
      const_reply_uid: e.currentTarget.dataset.uid
    });
  },
  replyreply: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.cmtid,
      const_reply_uid: e.currentTarget.dataset.uid
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //e.detail.formId
    if (e.detail.value.reply_text != "") {
      wx.showLoading({
        title: '正在发送',
        mask: true,
      });
      var reply_text = e.detail.value.reply_text;
      //const_reply_index
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/comment_add", {
        class_id: that.data.item.class_id,
        content: reply_text,
        images: '',
        cid: that.data.const_comment_id,
        touid: that.data.const_reply_uid,
        reply_id: that.data.const_reply_id
      }, function (res) {
        //清空form
        wx.hideLoading();
        var commentlist = prevPage.data.commentlist;
        var commenta = res.data.data.comment;
        commenta["id"] = commenta["comment_id"];
        commentlist[that.data.commentindex].reply_list.unshift(commenta);
        commentlist[that.data.commentindex].reply_num++;
        prevPage.setData({
          commentlist: commentlist
        });

        var replylist = that.data.replylist;
        replylist.push(commenta);
        that.setData({
          'item.reply_num': that.data.item.reply_num + 1,
          replylist: replylist
        });
        //todo 提交到列表页
      })
    }
  },
  dianzanComment: function (e) {
    var that = this;
    var like = e.currentTarget.dataset.like;
    var like_num = e.currentTarget.dataset.likenum;
    var index = that.data.commentindex;
    var cid = that.data.commentid;
    var like_str = 'commentlist[' + index + '].isliked';
    var like_num_str = 'commentlist[' + index + '].like_num';
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    if (like > 0) {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_del", { comment_id: cid }, function (res) {
        prevPage.setData({
          [like_str]: 0,
          [like_num_str]: --like_num,
        });
        that.setData({
          'item.isliked': 0,
          'item.like_num': like_num
        });
      });
    } else {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/comment_like_add", { comment_id: cid }, function (res) {
        prevPage.setData({
          [like_str]: 1,
          [like_num_str]: ++like_num,
        });
        that.setData({
          'item.isliked': 1,
          'item.like_num': like_num
        });
      });
    }
  }
})