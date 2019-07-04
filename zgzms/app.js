// 创建应用程序对象
App({
  // ========== 全局数据对象（整个应用程序共享） ==========
  globalData: {
    mainDomain:"https://api.52jiaoshi.com/",
    mainQueryDomain: "https://api.52jiaoshi.com/",
    // mainDomain:"https://api.bornedu.com/",
    // mainQueryDomain: "https://api.bornedu.com/",
    // mainDomain: "https://ceshi.bornedu.com/",
    // mainQueryDomain: "https://ceshi.bornedu.com/",
    userToken: "",
    openId:"",
    unionId:"",
    wx_ltk:"",
    mobile:"",
    nickname:"",
    headimgurl:"",
    rejectinfo:0,
    activityUrl: 'http://www.52jiaoshi.com/zhaopin.com',
    activityTitle : '',
    reguCity:0,
    dbyStore:{},
    systemInfo:{},
    login_session_code: '',
    scene_type:''
  },

  // ========== 应用程序全局方法 ==========
  // fetchApi (url, callback) {
  //   // return callback(null, top250)
  //   wx.request({
  //     url,
  //     data: {},
  //     header: { 'Content-Type': 'application/json' },
  //     success (res) {
  //       callback(null, res.data)
  //     },
  //     fail (e) {
  //       console.error(e)
  //       callback(e)
  //     }
  //   })
  // },

  // ========== 生命周期方法 ==========

  onLaunch (options) {
    // 应用程序启动时触发一次
    // console.log('App Launch')
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
      }
    });
  },

  onShow (options) {
    // 当应用程序进入前台显示状态时触发
    // console.log('App Show')
    // console.log(options)
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1014 || options.scene == 1044){

      wx.request({
        url: this.globalData.mainDomain + "ApiNlpgbg/xcx_share_stat",
        data: { scene: options.scene },
        method: "POST",
        header: { 'content-type': 'application/x-www-form-urlencoded', 'Version': '3.8.0' },
        dataType: 'json',
        success: function (res) {
        },
        fail: function () { }
      })
    }

  },

  onHide () {
    // 当应用程序进入后台状态时触发
  }
})
