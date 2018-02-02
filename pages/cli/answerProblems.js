// pages/cli/answerProblems.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null,
    roomStatus: '等待中...',
    problem: null,
    ready: false,
    choicedIdx: undefined,
    wsConn: null,
    debugTimer: null,
    roomId: null,
    processing: true,
    stepCode: 0,
    stepDuration: 0,
    counter: 0,
    roomOwner: null,
    requesting: false
  },

  resetTimer: function () {
    var self = this;
    clearInterval(this.data.timer);
    self.data.timer = setInterval(function () {
      self.setData({ counter: self.data.counter - 1 })
    }, 1100)
  },

  processStatusMessage: function (data, bSnapshot) {
    // 处理状态相关数据: 快照以及状态转换通知
    // 不同的是 快照数据会带当前读秒计数: counter, 同时又enable 字段标志用户是否可以答题
    console.log(data)
    var self = this;
    self.setData({
      roomOwner: data.owner,
      counter: data.duration,
      stepCode: data.st
    })
    if (data.st == 1) {
      // 开始倒计时
      self.resetTimer()
    } else if (data.st == 2) {
      // 答题时间
      var pb = {
        content: data.data.content,
        choice: Array()
      }
      var ops = data.data.options;
      for (var i = 0; i< ops.length; ++i) {
        pb.choice.push({ idx: ops[i].idx, val: ops[i].val, cls: 'unselect' })
      }
      console.log(pb)
      self.setData({
        problem: pb,
        ready: true
      })
      self.resetTimer()
    }
  },

  ezSendMsg: function (data) {
    if (this.data.requesting) return false;
    this.data.wsConn.send({
      data: data,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
    return true;
  },

  startRoomTap: function (e) {
    this.ezSendMsg('{"t": 2}')
  },

  clickChoiceTap: function (e) {
    console.log(e)
    if (typeof (this.data.choicedIdx) == 'undefined') {
      var pb = this.data.problem
      var choiced = pb.choice[parseInt(e.currentTarget.id)]
      choiced.cls = 'selected'
      this.setData({
        problem: pb,
        choicedIdx: choiced
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.roomId = options.code
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
    var self = this
    var user = wx.getStorageSync("user")
    self.setData({ user: user.openid })
    this.data.wsConn = wx.connectSocket({
      url: util.wsAddr + '?r=' + this.data.roomId + '&u=' + user.openid,
      success: function (res) {
        self.setData({
          roomStatus: '连接成功',
          processing: false,
          roomExist: true
        })
      },
      fail: function (res) {
        self.setData({ roomStatus: "服务器错误" })
      }
    }),
      this.data.wsConn.onMessage(function (msg) {
        console.log(msg)
        var obj = JSON.parse(msg.data)
        if (obj.code == 3) {
          //快照消息
          self.processStatusMessage(obj.data, true)
        } else if (obj.code == 2){
          // 状态转换消息
          self.processStatusMessage(obj.data, false)
        }else if (obj.code == 200) {
          // 请求成功响应
          console.log('request success')
          self.setData({ requesting: false })
        } else if (obj.code == 500) {
          // 请求失败响应
          console.log('request failed.')
          self.setData({ requesting: false })
        }
      })
    this.data.wsConn.onClose(function (errMsg) {
      self.setData({
        roomStatus: '房间不存在',
        processing: false
      })
    })
    this.data.wsConn.onOpen(function (errMsg) {

    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})