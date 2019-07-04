// pages/practice/practice/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js');
var otherans = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    current: 0, //主动设置swiper页面
    swpIndex: 0, //记录实际的当前swiper页面
    examid: 0,
    items : [],
    itemsSelected : [],
    answers:[],
    correct_answer:[],
    allpage:0,
    answerpage:0,
    starttime:'',
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    winWidth: 0,
    winHeight: 0,
    scrollHeight:0,
    SDKVersion:'1.5.0',
    cart_hide: 'cart_hide',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    var newids = [];
    var examid = 0;
    examid = options.id;
    // examid = 1538;
    that.setData({
      winWidth: app.globalData.systemInfo.windowWidth,
      winHeight: app.globalData.systemInfo.windowHeight,
      scrollHeight: app.globalData.systemInfo.windowHeight - 100,
      SDKVersion: app.globalData.systemInfo.SDKVersion
    });
    
    userApi.xcx_login_new(1,0,function(){
      // 试卷描述
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Incorrent/exam_description",
        { id: examid },
        function (res) {
          var time = parseInt(res.data.data.mokaomessage.times * 60);
          //let scores = res.data.data.mokaomessage.scores.replace();
          that.setData({
            examid: examid,
            description: res.data.data.mokaomessage,
            time: time
          });
          wx.setNavigationBarTitle({
            //title: res.data.data.mokaomessage.title
            title: '模考答题'
          })
        });
      // 试卷中题目ID
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Practice/paperquestions", { paperid: examid }, function (res) {
        // 提取所有题目ID
        console.log(res.data.data);
        var ids = new Array(res.data.data.length);
        for (var i = 0; i < res.data.data.length;i++){
          ids[i] = { id: res.data.data[i].id, ques: [], ans: [0, 0, 0, 0, 0, 0],ans_txt:'' }; 
        }
        that.setData({
          items: ids,
          allpage: ids.length
        },function(){
          that.start();
          that.getQuestions(0);
        });
      });
    });
  },
  getQuestions: function(index) {
    var that = this;
    var _items = that.data.items;
    let _allpage = that.data.allpage;

    let shi_from = parseInt(index / 10,10);
    let shi_to = shi_from + 1;

    let idx_from = shi_from * 10;
    let idx_to = shi_to * 10 - 1;

    if (idx_from >= _allpage){
      //10题里面的最后一题
      return;
    }
    if (idx_to >= _allpage){
      //防止越界
      idx_to = _allpage - 1;
    }
    if (_items[idx_from].ques && _items[idx_from].ques.title && _items[idx_from].ques.title.length){
      return;
    }
    wx.showLoading({
      title: '正在加载题目',
    });
    let strids = [];
    for (let lp = idx_from ; lp <= idx_to; lp ++){
      strids.push(_items[lp].id);
    }
    // 获取题
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/question",
      { ids: strids.toString() },
      function (res) {
        var datas = res.data.data;
        for (let il = 0; il < datas.length; il++) {
          // 题目题干
          var arr_title=[];
          for (var ii = 0; ii < datas[il].title.length; ii++){
            var child_title = {};
            if (datas[il].title[ii].type == 'txt') {
              child_title.name = 'span';
              if (datas[il].title[ii].size != '14' || datas[il].title[ii].color != '#000000'){
                child_title.attrs = { style: 'font-size:' + datas[il].title[ii].size + 'px;color:' + datas[il].title[ii].color };
              }else{
                child_title.attrs = {};
              }
              child_title.children = [];
              child_title.children.push({ type: 'text', text: datas[il].title[ii].content });
            } else if (datas[il].title[ii].type == 'img') {
              child_title.name = 'img';
              child_title.attrs = {};
              child_title.attrs.src = datas[il].title[ii].src;
              child_title.attrs.style = "width:100%;";
            } else if (datas[il].title[ii].type == 'br'){
              child_title.name = 'br';
            } 
            arr_title.push(child_title);
          }
          
          datas[il].arr_title = arr_title;

          if (datas[il].item_a) {
            // 答案A
            var arr_item_a = [];
            var child_item_a = {};
            if (datas[il].item_a[0].type == 'txt') {
              child_item_a.name = 'span';
              child_item_a.attrs = {};
              child_item_a.children = [];
              child_item_a.children.push({ type: 'text', text: datas[il].item_a[0].content });
            } else if (datas[il].item_a[0].type == 'img') {
              child_item_a.name = 'img';
              child_item_a.attrs = {};
              child_item_a.attrs.src = datas[il].item_a[0].src;
              child_item_a.attrs.style = "width:100%;";
            }
            arr_item_a.push(child_item_a);
            datas[il].arr_item_a = arr_item_a;
          }

          if (datas[il].item_b) {
            // 答案B
            var arr_item_b = [];
            var child_item_b = {};
            if (datas[il].item_b[0].type == 'txt') {
              child_item_b.name = 'span';
              child_item_b.attrs = {};
              child_item_b.children = [];
              child_item_b.children.push({ type: 'text', text: datas[il].item_b[0].content });
            } else if (datas[il].item_b[0].type == 'img') {
              child_item_b.name = 'img';
              child_item_b.attrs = {};
              child_item_b.attrs.src = datas[il].item_b[0].src;
              child_item_b.attrs.style = "width:100%;";
            }
            arr_item_b.push(child_item_b);
            datas[il].arr_item_b = arr_item_b;
          }

          if (datas[il].item_c) {
            // 答案C
            var arr_item_c = [];
            var child_item_c = {};
            if (datas[il].item_c[0].type == 'txt') {
              child_item_c.name = 'span';
              child_item_c.attrs = {};
              child_item_c.children = [];
              child_item_c.children.push({ type: 'text', text: datas[il].item_c[0].content });
            } else if (datas[il].item_c[0].type == 'img') {
              child_item_c.name = 'img';
              child_item_c.attrs = {};
              child_item_c.attrs.src = datas[il].item_c[0].src;
              child_item_c.attrs.style = "width:100%;";
            }
            arr_item_c.push(child_item_c);
            datas[il].arr_item_c = arr_item_c;
          }

          if (datas[il].item_d) {
            // 答案D
            var arr_item_d = [];
            var child_item_d = {};
            if (datas[il].item_d[0].type == 'txt') {
              child_item_d.name = 'span';
              child_item_d.attrs = {};
              child_item_d.children = [];
              child_item_d.children.push({ type: 'text', text: datas[il].item_d[0].content });
            } else if (datas[il].item_d[0].type == 'img') {
              child_item_d.name = 'img';
              child_item_d.attrs = {};
              child_item_d.attrs.src = datas[il].item_d[0].src;
              child_item_d.attrs.style = "width:100%;";
            }
            arr_item_d.push(child_item_d);
            datas[il].arr_item_d = arr_item_d;
          }

          if (datas[il].item_e) {
            // 答案e
            var arr_item_e = [];
            var child_item_e = {};
            if (datas[il].item_e[0].type == 'txt') {
              child_item_e.name = 'span';
              child_item_e.attrs = {};
              child_item_e.children = [];
              child_item_e.children.push({ type: 'text', text: datas[il].item_e[0].content });
            } else if (datas[il].item_d[0].type == 'img') {
              child_item_e.name = 'img';
              child_item_e.attrs = {};
              child_item_e.attrs.src = datas[il].item_e[0].src;
              child_item_e.attrs.style = "width:100%;";
            }
            arr_item_e.push(child_item_e);
            datas[il].arr_item_e = arr_item_e;
          }

          if (datas[il].item_f) {
            // 答案f
            var arr_item_f = [];
            var child_item_f = {};
            if (datas[il].item_f[0].type == 'txt') {
              child_item_f.name = 'span';
              child_item_f.attrs = {};
              child_item_f.children = [];
              child_item_f.children.push({ type: 'text', text: datas[il].item_f[0].content });
            } else if (datas[il].item_d[0].type == 'img') {
              child_item_f.name = 'img';
              child_item_f.attrs = {};
              child_item_f.attrs.src = datas[il].item_f[0].src;
              child_item_f.attrs.style = "width:100%;";
            }
            arr_item_f.push(child_item_f);
            datas[il].arr_item_f = arr_item_f;    
          }

          _items[idx_from + il].ques = datas[il];
        }
        that.setData({
          items: _items
        });
        console.log(_items);
        wx.hideLoading();
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
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.description.title,
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
   * 答题点击事件
   */
  swipclick: function (e) {
    var that = this;
    let _ai = e.currentTarget.dataset.anindex;
    let _i = e.currentTarget.dataset.index;
    let ans = that.data.items[_i].ans;
    let datastr = 'items[' + _i + '].ans';
    let selectans = e.currentTarget.dataset.answer;
    let _selectedans = 'items[' + _i + '].ans_txt';
    let _answerpage = that.data.answerpage;
    let _type = e.currentTarget.dataset.type;
    if (_type == 1 || _type == 3){
      if (ans[_ai] > 0) {
        //取消选中
        ans[_ai] = 0;
        _answerpage--;
        that.setData({
          [datastr]: ans,
          answerpage: _answerpage,
          [_selectedans]: ''
        });
      } else {
        //选择答案
        ans = [0, 0, 0, 0, 0, 0];
        ans[_ai] = 1;
        _answerpage++;
        console.log(that.data.SDKVersion);
        if (that.data.SDKVersion >= '1.5.0') {
          that.setData({
            [datastr]: ans,
            answerpage: _answerpage,
            [_selectedans]: selectans
          }, function () {
            setTimeout(function () {
              that.setData({
                current: _i + 1 + 1,
                swpIndex: _i + 1 + 1
              });
            }, 200);
          });
        } else {
          that.setData({
            [datastr]: ans,
            answerpage: _answerpage,
            [_selectedans]: selectans,
            current: _i + 1 + 1,
            swpIndex: _i + 1 + 1
          });
        }
      }
    } else if (_type == 2){
      //多项选择题选择答案
      if (that.data.items[_i].ans_txt){
        otherans = that.data.items[_i].ans_txt;
      }
      if (ans[_ai]) {
        ans[_ai] = 0;
        otherans = otherans.replace(selectans, '');
      } else {
        ans[_ai] = 1;
        otherans += selectans;
      }
      console.log(otherans);
      that.setData({
        [datastr]: ans,
        [_selectedans]: otherans
      })
    }
    
  },
  /**
   * 处理滚动事件处理
   */
  listenSwiper: function (e) {
    var that = this;
    let cr = e.detail.current;
    that.setData({
      swpIndex: e.detail.current,
    });
    if (cr > 0 && cr <= that.data.allpage){
      that.getQuestions(cr - 1);
    }
    if (otherans){
      otherans = '';
    }
  },
  /**
   * 提交结果
   */
  submitresult:function(e){
    var that = this;
    var message = {};

    wx.showModal({
      title: '确认',
      content: '确认交卷吗？',
      success: function (modres){
        if (modres.confirm){
          message.starttime = that.data.starttime;
          message.edu_id = '';
          message.paperid = that.data.examid;
          message.score = 0;
          message.result = [];

          for (var i = 0; i < that.data.items.length; i++) {
            var result_json = {};
            result_json.score = 0;
            result_json.orders = i;
            result_json.questionid = that.data.items[i].ques.id;
            result_json.answer = that.data.items[i].ans_txt;
            if (that.data.items[i].ans_txt == that.data.items[i].ques.answer) {
              result_json.result = 1;
              result_json.score++;
            } else {
              result_json.result = 2;
            }
            message.result.push(result_json);
          }
          for (var j = 0; j < message.result.length; j++) {
            message.score = parseInt(message.score + message.result[j].score);
          }
          wx.showLoading({
            title: '交卷中，请稍后',
          });
          console.log(message);
          userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/practice_record",
            { data: JSON.stringify(message) },
            function (res) {
              wx.hideLoading();
              wx.redirectTo({
                url: '../examdetail/examdetail?id=' + that.data.examid,
              })
          });
        }
      }
    });
  },
  start:function(){
    const that =this;
    if (that.data.starttime != ''){
      return;
    }
    var myDate = new Date();
    var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var month = myDate.getMonth() + 1;       //获取当前月份(0-11,0代表1月)
    var day = myDate.getDate();        //获取当前日(1-31)
    var Hours = myDate.getHours(); //获取当前小时数(0-23)
    var Minutes = myDate.getMinutes(); //获取当前分钟数(0-59)
    var Seconds = myDate.getSeconds(); //获取当前秒数(0-59)
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 1 && day <= 9) {
      day = "0" + day;
    }
    if (Hours >= 1 && Hours <= 9) {
      Hours = "0" + Hours;
    }
    if (Minutes >= 1 && Minutes <= 9) {
      Minutes = "0" + Minutes;
    }
    if (Seconds >= 1 && Seconds <= 9) {
      Seconds = "0" + Seconds;
    }
    var starttime = year + '-' + month + '-' + day + ' ' + Hours + ':' + Minutes + ':' + Seconds;

    //倒计时
    var totalSecond = that.data.time;
    
    var interval = setInterval(function () {
      // 秒数  
      var second = totalSecond;
      // 分钟位  
      var min = Math.floor((second) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位  
      var sec = second - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      that.setData({
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        //设置结束
        that.setData({
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);  
    that.setData({
      starttime: starttime
    })
  },
  hidecard:function(e){
    this.setData({
      cart_hide: 'cart_hide'
    }) 
  },
  ckeckcard:function(e){
    this.setData({
      cart_hide: ''
    })  
  },
  // 查看某一道题
  checkitem: function (e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    that.setData({
      current: index,
      cart_hide: 'cart_hide'
    })  
  }
})