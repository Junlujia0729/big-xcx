// pages/download/score.js
const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'神秘人士',
    channel:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    if (options.channel){
      that.setData({
        channel: options.channel,
      });
    }
    if (options.name != '' && options.name != undefined) {
      that.setData({
        name: options.name,
      });
    }
    if (app.globalData.nickname != ""){
      that.setData({
        name: options.name,
      });
      var name = encodeURI(that.data.name);
      wx.downloadFile({
        url: app.globalData.mainDomain + "H5activity/gen_share_score?name=" + name, //仅为示例，并非真实的资源
        success: function (res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            that.setData({
              fileimg: res.tempFilePath,
            });
          }
        }
      })
    }else{
      wx.getUserInfo({
        success: function (res1) {
          var nickName = res1.userInfo.nickName;
          app.globalData.nickname = nickName;
          that.setData({
            name: nickName,
          });
          wx.downloadFile({
            url: app.globalData.mainDomain + "H5activity/gen_share_score?name=" + nickName, //仅为示例，并非真实的资源
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                that.setData({
                  fileimg: res.tempFilePath,
                });
              }
            }
          })
        }, fail: function () {
          var name = encodeURI(that.data.name);
          wx.downloadFile({
            url: app.globalData.mainDomain + "H5activity/gen_share_score?name=" + name, //仅为示例，并非真实的资源
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                that.setData({
                  fileimg: res.tempFilePath,
                });
              }
            }
          })
        }
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
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    
    return {
      title: '我通过了教师资格证笔试，你也来查查吧',
      path: '/pages/queryscore/queryscore?' + that.data.channel,
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
        //console.log(res1.shareTickets[0]);
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },
  imageDown: function (e) {
    var that = this;
    wx.getSetting({
      success(ss) {
        if (!ss.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.saveImageToPhotosAlbum({
                filePath: that.data.fileimg,
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
            filePath: that.data.fileimg,
            success(ires) {
              wx.showModal({
                title: '提示',
                content: '保存成功',
                showCancel: false
              })
            }
          })
        }
      }
    })
  }
})