const app = getApp();
const userApi = require('../../../../libraries/user.js');

Page({
  data: {
    src: ''
  },
  upload () {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]

        wx.navigateTo({
          url: `../upload/upload?src=${src}`,
        });
        // ({
        //   url: ``
        // })
      }
    })
  },
  onLoad (option) {
    let { avatar } = option
    if (avatar) {
      this.setData({
        src: avatar
      })
    }
    userApi.xcx_login_new(1, 0, function () {
    });
  },
  onShareAppMessage() {
    var that = this;
    return {
      title: '教师资格证教师招聘考试报名照片裁剪',
      path: '/pages/cropper/zgzphone/index/index',
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
  }
})
