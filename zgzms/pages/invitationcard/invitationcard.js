const app = getApp();
const userApi = require('../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    cards:[
      { isactive: '1', img: 'http://imgs.52jiaoshi.com/1517827913.png' },
      { isactive: '0', img: 'http://imgs.52jiaoshi.com/1517828179.png' },
      { isactive: '0', img: 'http://imgs.52jiaoshi.com/1517641416.jpg' },
      { isactive: '0', img: 'http://imgs.52jiaoshi.com/1517641416.jpg' },
    ],
    url: ''
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    wx.showLoading({
      title: '正在生成',
    });
    const that = this;
    // params.classid = 10443;
    var classid = params.classid;
    that.setData({
      classid: params.classid,
      url: app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + params.classid + "&id=1&token=" + app.globalData.userToken ,
      urls:[
        app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + params.classid + "&id=1&token=" + app.globalData.userToken,
        app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + params.classid + "&id=2&token=" + app.globalData.userToken,
        app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + params.classid + "&id=3&token=" + app.globalData.userToken,
        app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + params.classid + "&id=4&token=" + app.globalData.userToken,
      ]
    })
    
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Distribute/background", { classid: classid}, function (res) {
        
        for (var i = 0; i < res.data.data.length;i++){
          res.data.data[i].isactive = 0;
          if(i == 0 ){
            res.data.data[i].isactive = 1;
          }
        }
        console.log(res.data.data);
        that.setData({
          cards: res.data.data
        })
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "/Home/Distribute/share_setting", {
        classid: that.data.classid,
      }, function (res) {
        that.setData({
          sharedatas: res.data.data
        })
      });
    });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
      title: that.data.sharedatas.title,
      path: that.data.sharedatas.path,
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
  imageDown: function (e) {
    var that = this;
    var fileimg = '';
    wx.downloadFile({
      url: that.data.url, //仅为示例，并非真实的资源
      success: function (res) {
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
      }, fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '下载图片失败',
        })
      }
    })
  },

  // 选中卡片
  select:function(e){
    const that = this;
    var cards = that.data.cards;
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    for(var i=0;i<cards.length;i++){
      cards[i].isactive = 0;
      if(i == index){
        cards[i].isactive = 1;
      }
    }
    wx.showLoading({
      title: '正在生成',
    });
    that.setData({
      cards:cards,
      url: app.globalData.mainDomain + "Distribute/gen_share_pic?classid=" + that.data.classid + "&id=" + id +"&"+"token=" + app.globalData.userToken 
    })
  },

  //图片加载完毕
  imgload:function(e){
    wx.hideLoading();
  },

  // 预览图片
  previewImage:function(e){
    const that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: [current] // 需要预览的图片http链接列表  
    })
  }
}) 
