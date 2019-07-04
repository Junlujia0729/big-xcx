// pages/practice/practice/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js')
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
    answers:[],
    allpage:0,
    starttime:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    var examid = 0;
    if (options.key){
      var key = options.key;
    }else{
      var key = 3;
    }
    
    const titles = ['错题解析','错题解析','全部解析','错误率排行'];
    let index = 0;
    if (options.index){
      index = options.index;
    }
    examid = options.id;
    // examid = 1538;
    wx.showLoading({
      title: '正在加载',
    })
    userApi.xcx_login_new(1,0,function(){
      // 试卷描述
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Incorrent/exam_description",
        { id: examid },
        function (res) {
          that.setData({
            examid: examid,
            key: key,
            description: res.data.data.mokaomessage,
            current: index
          });
          wx.setNavigationBarTitle({
            title: titles[key]
          })
        });
      // 试卷中题目ID
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Practice/paperquestions", { paperid: examid }, function (res) {
        // 提取所有题目ID
        // console.log(res.data.data);
        var ids = new Array(res.data.data.length);
        var allids = [];
        for (var i = 0; i < res.data.data.length;i++){
          ids[i] = { id: res.data.data[i].id, ques: [], ans: [0, 0, 0, 0, 0, 0],ans_txt:'' }; 
          allids.push(res.data.data[i].id);
        }
        allids = allids.toString();
        that.setData({
          items: ids,
          allpage: ids.length
        },function(){
          that.getQuestions(allids);
          
        });
      });
      
    });
  },
  getQuestions: function (allids) {
    var that = this;
    var _items = that.data.items;
    // 获取题
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/question",
      { ids: allids },
      function (res) {
        console.log(res.data.data);

        var datas = res.data.data;
        for (let il = 0; il < datas.length; il++) {
          // 题目题干
          var arr_title = [];
          for (var ii = 0; ii < datas[il].title.length; ii++) {
            var child_title = {};
            if (datas[il].title[ii].type == 'txt') {
              child_title.name = 'span';
              if (datas[il].title[ii].size != '14' || datas[il].title[ii].color != '#000000') {
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
            } else if (datas[il].title[ii].type == 'br') {
              child_title.name = 'br';
            }
            arr_title.push(child_title);
          }
          datas[il].arr_title = arr_title;

          // 题目解析
          var arr_questionanalysis = [];
          var child_questionanalysis = {};
          if (datas[il].questionanalysis && datas[il].questionanalysis.length > 0){
            if (datas[il].questionanalysis[0].type == 'txt') {
              child_questionanalysis.name = 'span';
              child_questionanalysis.attrs = {};
              child_questionanalysis.children = [];
              child_questionanalysis.children.push({ type: 'text', text: datas[il].questionanalysis[0].content });
            } else if (datas[il].title[0].type == 'img') {
              child_questionanalysis.name = 'img';
              child_questionanalysis.attrs = {};
              child_questionanalysis.attrs.src = datas[il].questionanalysis[0].src;
              child_questionanalysis.attrs.style = "width:100%;";
            }
          }
          arr_questionanalysis.push(child_questionanalysis);
          datas[il].arr_questionanalysis = arr_questionanalysis;

          if (datas[il].item_a){
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

          if (datas[il].item_b){
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
          
          if (datas[il].item_c){
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
          
          if (datas[il].item_d){
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
          _items[il].ques = datas[il];

          _items[il].ques.answer = datas[il].answer.split('');
          _items[il].ques.allanswer = [0, 0, 0, 0, 0, 0];
          if (_items[il].ques.answer && _items[il].ques.answer.length > 0) {
            for (var j = 0; j < 6; j++) {
              if (_items[il].ques.answer[j] == 'A') {
                _items[il].ques.allanswer[0] = 1;
              } else if (_items[il].ques.answer[j] == 'B') {
                _items[il].ques.allanswer[1] = 1;
              } else if (_items[il].ques.answer[j] == 'C') {
                _items[il].ques.allanswer[2] = 1;
              } else if (_items[il].ques.answer[j] == 'D') {
                _items[il].ques.allanswer[3] = 1;
              } else if (_items[il].ques.answer[j] == 'E') {
                _items[il].ques.allanswer[4] = 1;
              } else if (_items[il].ques.answer[j] == 'F') {
                _items[il].ques.allanswer[5] = 1;
              }
            }
          }
          
        }
        console.log(_items);
        // for (let il = 0; il < res.data.data.length; il++) {
        //   _items[il].ques = res.data.data[il];
        // }
        that.getalldatas(that.data.examid, _items);
      });
  },
  //用户作答记录
  getalldatas:function(examid,_itemsori){
    
    var that = this;
    var _items = _itemsori;
    userApi.requestAppApi_GET(app.globalData.mainDomain + "/Home/incorrent/examresult", { id: examid }, function (res) {
      wx.hideLoading();
      console.log(res.data.data);
      for (var i = 0; i < res.data.data.questions.length; i++) {
        var peritem = (parseInt(res.data.data.questions[i].glbstats.count, 10) ? parseInt((parseInt(res.data.data.questions[i].glbstats.error, 10) / parseInt(res.data.data.questions[i].glbstats.count, 10)), 10) : 0) * 100;
        _items[i].peritem = peritem;
        _items[i].perresult = res.data.data.questions[i].result;
        _items[i].perdata = res.data.data.questions[i];

        _items[i].perdata.answer = res.data.data.questions[i].answer.split('');
        _items[i].perdata.allanswer = [0, 0, 0, 0, 0, 0];
        if (_items[i].perdata.answer && _items[i].perdata.answer.length > 0){
          for (var j = 0; j < 6;j++){
            
            if (_items[i].perdata.answer[j] == 'A'){
              _items[i].perdata.allanswer[0] = 1;
            } else if (_items[i].perdata.answer[j] == 'B'){
              _items[i].perdata.allanswer[1] = 1;
            } else if (_items[i].perdata.answer[j] == 'C') {
              _items[i].perdata.allanswer[2] = 1;
            } else if (_items[i].perdata.answer[j] == 'D') {
              _items[i].perdata.allanswer[3] = 1;
            } else if (_items[i].perdata.answer[j] == 'E') {
              _items[i].perdata.allanswer[4] = 1;
            } else if (_items[i].perdata.answer[j] == 'F') {
              _items[i].perdata.allanswer[5] = 1;
            }
          }  
        }
      }
      console.log(_items);
      // key : 1 错题解析，2 全部解析 ，3错题排行
      if (that.data.key == 1){
        var _newitems = [];
        for (var j = 0; j < _items.length; j++) {
          if (_items[j].perresult == 2) {
            _newitems.push(_items[j]);
          }
        }
        that.setData({
          items: _newitems,
          allpage: _newitems.length,
          desctitle:'错题解析'
        });
        console.log(that.data.items);
      } else if (that.data.key == 3){
        _items.sort(compare('peritem'));
        that.setData({
          items: _items,
          desctitle: '错题排行'
        });
      } else if (that.data.key == 2){
        that.setData({
          items: _items,
          desctitle: '全部解析'
        });
      }  
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   
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
  },

})
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value2 - value1;
  }
}