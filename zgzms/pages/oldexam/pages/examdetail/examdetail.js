const app = getApp();
const userApi = require('../../../../libraries/user.js');
var WxParse = require('../../../../wxParse/wxParse.js');

var gDuration = 0;
var gIssignup = 0;
var gStarttime = 0;
var gEndtime = 0;
var interval = null;
// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    examid: 0,
    state:[],
    item:[],
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0, 
    clock: 0, //是否显示倒计时
    clocktext: '倒计时',  //倒计时的文案
    btntext: '立即报名',  //button的显示内容
    btnoper: 0,  //button的操作   0 没有操作 
                                // 1 报名
                                // 2 进入考场
                                // 3 查看考试成绩
                                // 4 查看解析
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    let examid = 1503;
    if (params.scene && params.scene != "") {
      examid = decodeURIComponent(options.scene);
    } else {
      if (params.id) {
        examid = params.id;
      }
    }
    
    that.setData({
      examid: examid
    });
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "/Home/incorrent/xcx_exam_detail", { id: examid}, function (res) {
        console.log(res.data.data);
        //倒计时
        that.setData({
          item: res.data.data.content,
          state: res.data.data.state
        });
        var article = res.data.data.content.detail;
        WxParse.wxParse('article', 'html', article, that, 5);

        gDuration = res.data.data.state.duration;
        gIssignup = res.data.data.state.issignup;
        gStarttime = res.data.data.state.starttime;
        gEndtime = res.data.data.state.endtime;
        that.looperFunc();
        interval = setInterval(that.looperFunc, 1000);
      });
    });
  },
  looperFunc : function(){
    let that = this;
    let duration = 0;
    let btext = '';
    let boper = 0;
    let ctext = '倒计时';

    if(gIssignup == 0) {
      if (gDuration > 900) {
        //报名倒计时
        duration = gDuration - 900;
        btext = '报名';
        boper = 1;
      } else {
        //查看解析倒计时
        ctext = '查看解析';
        duration = gEndtime + 900 - (gStarttime - gDuration);
        if (duration <= 0) {
          duration = 0;
          btext = '查看解析';
          boper = 4;
        } else {
          if (duration > 900) {
            btext = '报名已结束';
          } else {
            btext = '考试已结束';
          }
        }
      }
    }

    if (gIssignup == 1) {
      if (gDuration > 0) {
        //进入考场倒计时
        duration = gDuration;
        btext = '开始考试';
      } else {
        if (gDuration > -900) {
          //15分钟之内
          duration = 0;
          boper = 2;
          btext = '进入考场';
        } else {
          //查看解析倒计时
          ctext = '查看解析';
          duration = gEndtime + 900 - (gStarttime - gDuration);
          if (duration <= 0) {
            duration = 0;
            btext = '查看解析';
            boper = 4;
          } else {
            if (duration > 900) {
              btext = '入场已结束';
            } else {
              btext = '考试已结束';
            }
          }
        }
      }
    }

    if (gIssignup == 2) {
      //查看解析倒计时
      ctext = '查看成绩';
      duration = gEndtime + 900 - (gStarttime - gDuration);
      if (duration <= 0) {
        duration = 0;
        btext = '查看考试成绩';
        boper = 3;
      } else {
        btext = '已交卷';
      }
    }

    gDuration--;
    if(duration > 0) {
      var totalSecond = duration;

      // 秒数  
      var second = totalSecond;

      // 天数位  
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位  
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位  
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位  
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      that.setData({
        clock: 1,
        clocktext: ctext,
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
        btntext: btext,
        btnoper: boper
      });
    } else {
      //设置结束
      that.setData({
        clock: 0,
        btntext: btext,
        btnoper: boper
      });
      if(boper == 4) {
        clearInterval(interval);
        interval = null;
      }
    }
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
      title: that.data.item.subtitle,
      path: '/pages/exam/examdetail/examdetail?id=' + that.data.examid,
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
  //页面卸载，销毁定时器
  onUnload: function(){
    if (interval){
      clearInterval(interval);
    }
  },
  //报名
  submitMokao : function(e){
    var that = this;
    //先上报formid
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
    });

    console.log(that.data.btnoper);
    switch(that.data.btnoper){
      case 0:break;
      case 1:
        //报名
        userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "Incorrent/examsignup", { id: that.data.examid }, function (res) {
          if (res.data.code == 200){
            gIssignup = 1;
            wx.showToast({
              title: '报名成功',
            });
            that.setData({
              'state.issingnup': 1,
            });
          }
        });
        break;
      case 2:
        //进入考场
        //redirect 方式处理
        wx.redirectTo({
          url: '../examindex/examindex?id=' + that.data.examid,
        })
        break;
      case 3:
        //查看考试成绩
        //navigate 方式处理
        wx.navigateTo({
          url: '../examresult/examresult?id=' + that.data.examid + '&title=' + that.data.item.title,
        })
        break;
      case 4:
        //查看解析
        //navigate 方式处理
        wx.navigateTo({
          url: '../examanalysis/examanalysis?id=' + that.data.examid,
        })
        break;
      default:break;
    }
  }

}) 