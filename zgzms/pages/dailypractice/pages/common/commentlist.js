const app = getApp();
const userApi = require('../../../../libraries/user.js');
var px2rpx = 2, windowWidth = 375;
const cmt_module_data = {
  cmtImages: [],
  const_reply_text: '',
  const_reply_id: 0,
  const_comment_id: 0,
  replay_words_count: 0,
  replay_to_user: '',
  const_reply_index: -1,
  const_reply_pindex: -1,
  const_reply_uid: 0
};

const cmt_module_config = {
  //这里开始是评论功能
  viewUserDetail: function (e) {
    // wx.navigateTo({
    //   url: '../user/user?id=' + e.currentTarget.dataset.userid,
    // })
  },
  replycomment: function (e) {
    var that = this;
    that.setData({
      replay_to_user: e.currentTarget.dataset.uname,
      const_reply_id: e.currentTarget.dataset.id,
      const_comment_id: e.currentTarget.dataset.cmtid,
      const_reply_pindex: e.currentTarget.dataset.index,
      const_reply_index: -1,
      const_reply_uid: e.currentTarget.dataset.uid
    });
    wx.navigateTo({
      url: '../addcomment/addcomment?id=' + e.currentTarget.dataset.classid + '&index=' + that.data.const_reply_pindex,
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
      url: '../addcomment/addcomment?id=' + e.currentTarget.dataset.classid + '&index=' + that.data.const_reply_pindex,
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
    var like_num = e.currentTarget.dataset.likenum;
    var index = e.currentTarget.dataset.index;
    var cid = e.currentTarget.dataset.id;
    var like_str = 'common_comment_list[' + index + '].isliked';
    var like_num_str = 'common_comment_list[' + index + '].like_count';
    var like_users_str = 'common_comment_list[' + index + '].like_users';
    var like_users = that.data.common_comment_list[index].like_users;

    if (like > 0) {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Daily/comment_like_del", { comment_id: cid }, function (res) {
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
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Daily/comment_like_add", { comment_id: cid }, function (res) {
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