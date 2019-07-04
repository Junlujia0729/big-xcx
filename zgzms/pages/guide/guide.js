// 拿到全局应用程序实例
const app = getApp()

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    toutiao:{
      id:1,
      img:'http://imgs.52jiaoshi.com/15106380285a0a81cce1452.jpg',
      title:'这样面试基本就挂了',
    },
    items:[
      {
        id: 1,
        img: 'https://mmbiz.qlogo.cn/mmbiz/9YO2p8jzsmOTqnO0lm8SRMVVia11REmbq6LDRTpYKPibQicvrIibzOpDrfC5tic78xIxjZUKEX3AHhQI8ibXHw5YibGGQ/0',
        title: '10名世界级教师的教学建议，也适用于家长',
      },
      {
        id: 1,
        img: 'https://mmbiz.qlogo.cn/mmbiz/9YO2p8jzsmOTqnO0lm8SRMVVia11REmbq9UxpTwvNT86Oe6zmR7kPibdWjavDlvPkJ4orwtcSzLSUBUQCicRk4xWw/0',
        title: '让学生集中注意力听你的课——美国资深教师的9大策略！',
      },
      {
        id: 1,
        img: 'https://mmbiz.qlogo.cn/mmbiz/9YO2p8jzsmOTqnO0lm8SRMVVia11REmbqd6IIzETm3rhgibwxz01XR6eTibJCGOZAwE5pF12SSLTG9lzR2hJDmqqQ/0',
        title: '教师怎么修炼绝活！',
      },
      {
        id: 1,
        img: 'https://mmbiz.qlogo.cn/mmbiz/9YO2p8jzsmPXpric0uON86tZYYibg8ZawUdBbL9kZLBFLvMlwz7Cqqk7UlO4yAibzYEWnibUrunZeLxv45B2q0OFqQ/0',
        title: '58个新年祝福，总有你喜欢的，别忘了送老师奥！',
      }
    ]
  },

  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    wx.request({
      url: app.globalData.mainDomain + "ApiNlpgbg/xcx_article_list",
      data: Object.assign({}, params),
      header: { 'content-type': 'application/json' },
      dataType: 'json',
      success: function (res) {
        that.setData({
          toutiao : res.data.data.toutiao,
          items : res.data.data.items,
        });
      },
      fail: function (res) {
        
      }
    })
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
      title: '52资格证面试干货',
      path: '/pages/guide/guide',
      imageUrl: 'http://www.52jiaoshi.com/download/52_green.jpg',
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
  onReady() {
    
  }
})
