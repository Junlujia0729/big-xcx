const app = getApp();
const userApi = require('../../libraries/user.js');
var utilComment = require('../common/commentlist.js');
var px2rpx = 2, windowWidth = 375;
// 播放
const innerAudioContext = wx.createInnerAudioContext();
let choose_year = null,
	choose_month = null;
var server_today = 0;
var tasklist = [];
const conf = {
	data: {
		hasEmptyGrid: false,
		showPicker: false,
    items: [],
    common_comment_list:[],
    is_loadingmore: 0,
    loadingmore_text: '正在加载',
    days:[]
	},
  onLoad(params) {
		const date = new Date();
		const cur_year = date.getFullYear();
		const cur_month = date.getMonth() + 1;
		const weeks_ch = [ '日', '一', '二', '三', '四', '五', '六' ];
		this.calculateEmptyGrids(cur_year, cur_month);
		this.setData({
			cur_year,
			cur_month,
			weeks_ch
		});
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl,
        column_id: params.id
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_classes", { column_id: params.id,all:1 }, function (res) {
        console.log(res.data.data);
        var datas = res.data.data.module_list;
        
        for (var i = 0; i < datas.length; i++) {
          //创建打卡信息
          for (var j = 0; j < datas[i].class_list.length; j++) {              
            var json = {};
            json.id = datas[i].class_list[j].id;
            json.task_year = parseInt(datas[i].class_list[j].daily_day.substr(0, 4), 10);
            json.task_month = parseInt(datas[i].class_list[j].daily_day.substr(4, 2), 10);
            json.task_day = parseInt(datas[i].class_list[j].daily_day.substr(6, 2),10);
            json.task_absday = parseInt(datas[i].class_list[j].daily_day,10);
            json.task_time = datas[i].class_list[j].dialy_time;

            tasklist.push(json);
          }
        }
        console.log(tasklist);
        server_today = parseInt(res.data.data.today,10);

        that.calculateDays(cur_year, cur_month);
        that.setData({
          items: res.data.data,
          today: server_today
        });
      });



      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_my_dialys", { column_id: params.id }, function (res) {
        that.setData({
          common_comment_list: res.data.data
        });
        var _common_comment_list = that.data.common_comment_list;
        //判断列表中是否有音频文件存在
        if (that.data.common_comment_list && that.data.common_comment_list.length > 0) {
          for (let i = 0; i < that.data.common_comment_list.length; i++) {

            // 如果评论里有音频
            if (that.data.common_comment_list[i].audio) {
              innerAudioContext.src = that.data.common_comment_list[i].audio;
              // 音频播放进度更新
              _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
              _common_comment_list[i].process_time = '00:00';
              _common_comment_list[i].ap_progress = 0;
              _common_comment_list[i].playstate = 'pause';
              _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
              that.setData({
                common_comment_list: _common_comment_list
              })
            }

            // 如果回复里有音频
            if (that.data.common_comment_list[i].reply_list && that.data.common_comment_list[i].reply_list.length > 0) {
              let replylist = _common_comment_list[i].reply_list;
              for (var j = 0; j < replylist.length; j++) {
                if (replylist[j].audio) {
                  replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                  replylist[j].reply_playstate = 'pause';
                  replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                  that.setData({
                    common_comment_list: _common_comment_list
                  })
                }
              }
            }
          }
        }
      });
    });
	},
	getThisMonthDays(year, month) {
		return new Date(year, month, 0).getDate();
	},
	getFirstDayOfWeek(year, month) {
		return new Date(Date.UTC(year, month - 1, 1)).getDay();
	},
	calculateEmptyGrids(year, month) {
		const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
		let empytGrids = [];
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				empytGrids.push(i);
			}
			this.setData({
				hasEmptyGrid: true,
				empytGrids
			});
		} else {
			this.setData({
				hasEmptyGrid: false,
				empytGrids: []
			});
		}
	},
	calculateDays(year, month) {
		let days = [];
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;

		const thisMonthDays = this.getThisMonthDays(year, month);
    
    var monthint = year * (month >= 10 ? 10 : 100 ) + month;

		for (let i = 1; i <= thisMonthDays; i++) {
      days.push({
        day: i,
        absday: monthint + '' + (parseInt(i, 10) >= 10 ? '' : '0') + i,
        choosed: false
      }); 
      for (let j = 0; j < tasklist.length ; j++){
        if (year == tasklist[j].task_year && month == tasklist[j].task_month && i == tasklist[j].task_day) {
          days.splice(i-1,1);
          days.push({
            day: i,
            absday: monthint + '' + (parseInt(i, 10) >= 10 ? '' : '0') + i,
            choosed: false,
            task: true,
            isbegin: server_today >= tasklist[j].task_absday ? 1 : 0,
            dialy_time: tasklist[j].task_time,
            id: tasklist[j].id,
          });
        }
      }
		}
    console.log(days);
		this.setData({
			days: days
		});
	},
	handleCalendar(e) {
		const handle = e.currentTarget.dataset.handle;
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;
		if (handle === 'prev') {
			let newMonth = cur_month - 1;
			let newYear = cur_year;
			if (newMonth < 1) {
				newYear = cur_year - 1;
				newMonth = 12;
			}

			this.calculateDays(newYear, newMonth);
			this.calculateEmptyGrids(newYear, newMonth);

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});

		} else {
			let newMonth = cur_month + 1;
			let newYear = cur_year;
			if (newMonth > 12) {
				newYear = cur_year + 1;
				newMonth = 1;
			}

			this.calculateDays(newYear, newMonth);
			this.calculateEmptyGrids(newYear, newMonth);

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});
		}
	},
	tapDayItem(e) {
		const idx = e.currentTarget.dataset.idx;
		const days = this.data.days;
		days[ idx ].choosed = !days[ idx ].choosed;
		this.setData({
			days,
		});
	},
  clock(e){
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../sectiondetail/sectiondetail?id=' + id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  nodaily: function (e) {
    wx.showToast({
      title: '这天没有任务',
    });
  },
  nobegin: function (e) {
    wx.showToast({
      title: '任务暂未开始',
    });
  },
	chooseYearAndMonth() {
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;
		let picker_year = [],
			picker_month = [];
		for (let i = 1900; i <= 2100; i++) {
			picker_year.push(i);
		}
		for (let i = 1; i <= 12; i++) {
			picker_month.push(i);
		}
		const idx_year = picker_year.indexOf(cur_year);
		const idx_month = picker_month.indexOf(cur_month);
		this.setData({
			picker_value: [ idx_year, idx_month ],
			picker_year,
			picker_month,
			showPicker: true,
		});
	},
	pickerChange(e) {
		const val = e.detail.value;
		choose_year = this.data.picker_year[val[0]];
		choose_month = this.data.picker_month[val[1]];
	},
	tapPickerBtn(e) {
		const type = e.currentTarget.dataset.type;
		const o = {
			showPicker: false,
		};
		if (type === 'confirm') {
			o.cur_year = choose_year;
			o.cur_month = choose_month;
			this.calculateEmptyGrids(choose_year, choose_month);
			this.calculateDays(choose_year, choose_month);
		}
		
		this.setData(o);
	},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.setData({
      cur_year,
      cur_month,
      weeks_ch
    });
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      that.setData({
        nickname: app.globalData.nickname,
        headimgurl: app.globalData.headimgurl
      });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/index/column_classes", { column_id: that.data.column_id, all: 1 }, function (res) {
        console.log(res.data.data);
        var datas = res.data.data.module_list;

        for (var i = 0; i < datas.length; i++) {
          //创建打卡信息
          for (var j = 0; j < datas[i].class_list.length; j++) {
            var json = {};
            json.id = datas[i].class_list[j].id;
            json.task_year = parseInt(datas[i].class_list[j].daily_day.substr(0, 4), 10);
            json.task_month = parseInt(datas[i].class_list[j].daily_day.substr(4, 2), 10);
            json.task_day = parseInt(datas[i].class_list[j].daily_day.substr(6, 2), 10);
            json.task_absday = parseInt(datas[i].class_list[j].daily_day, 10);
            json.task_time = datas[i].class_list[j].dialy_time;

            tasklist.push(json);
          }
        }
        console.log(tasklist);
        server_today = parseInt(res.data.data.today, 10);

        that.calculateDays(cur_year, cur_month);
        that.setData({
          items: res.data.data,
          today: server_today
        });
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_my_dialys", { column_id: that.data.column_id }, function (res) {
        that.setData({
          commentlist: res.data.data
        });
        var _common_comment_list = that.data.common_comment_list;
        //判断列表中是否有音频文件存在
        if (that.data.common_comment_list && that.data.common_comment_list.length > 0) {
          for (let i = 0; i < that.data.common_comment_list.length; i++) {

            // 如果评论里有音频
            if (that.data.common_comment_list[i].audio) {
              innerAudioContext.src = that.data.common_comment_list[i].audio;
              // 音频播放进度更新
              _common_comment_list[i].new_duration = formatTime(_common_comment_list[i].audio_duration / 1000);
              _common_comment_list[i].process_time = '00:00';
              _common_comment_list[i].ap_progress = 0;
              _common_comment_list[i].playstate = 'pause';
              _common_comment_list[i].play_img = 'http://imgs.52jiaoshi.com/1530841265.png';
              that.setData({
                common_comment_list: _common_comment_list
              })
            }

            // 如果回复里有音频
            if (that.data.common_comment_list[i].reply_list && that.data.common_comment_list[i].reply_list.length > 0) {
              let replylist = _common_comment_list[i].reply_list;
              for (var j = 0; j < replylist.length; j++) {
                if (replylist[j].audio) {
                  replylist[j].new_duration = formatTime(replylist[j].audio_duration / 1000);
                  replylist[j].reply_playstate = 'pause';
                  replylist[j].reply_audio_btn = 'http://imgs.52jiaoshi.com/1531100999.png';
                  that.setData({
                    common_comment_list: _common_comment_list
                  })
                }
              }
            }
          }
        }
      });
    });
    wx.stopPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.setData({
      is_loadingmore: 1,
      loadingmore_text: '正在加载'
    });
    var score = 0;
    var common_comment_list = that.data.common_comment_list;
    if (common_comment_list.length > 0) {
      score = common_comment_list[common_comment_list.length - 1].id;
    }
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Knowledge/user/column_my_dialys", { column_id: that.data.column_id, inf_id: score }, function (res) {
      if (res.data.data.length) {
        for (var i = 0; i < res.data.data.length; i++) {
          common_comment_list.push(res.data.data[i]);
        }
        that.setData({
          common_comment_list: common_comment_list,
          is_loadingmore: 0
        });
      } else {
        that.setData({
          loadingmore_text: '没有更多了'
        });
        setTimeout(function () {
          that.setData({
            is_loadingmore: 0
          });
        }, 3000);
      }
    });
  }
};
function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}
Page(utilComment.ext_comment_config(conf));
