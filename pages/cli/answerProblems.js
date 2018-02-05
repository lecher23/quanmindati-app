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
    choicedIdx: null,
    wsConn: null,
    debugTimer: null,
    roomId: null,
    processing: true,
    stepCode: 0,
    stepDuration: 0,
    counter: 0,
    roomOwner: null,
    requesting: false,
    showStartBtn: true,
    responseCallback: null,
    roomMsg: '',
    answerEnabled: true
  },

  resetTimer: function () {
    var self = this;
    clearInterval(this.data.timer);
    self.data.timer = setInterval(function () {
      if (self.data.counter > 0) self.setData({ counter: self.data.counter - 1 })
    }, 1100)
  },

  processStatusMessage: function (data, bSnapshot) {
    // 处理状态相关数据: 快照以及状态转换通知
    // 不同的是 快照数据会带当前读秒计数: counter, 同时又enable 字段标志用户是否可以答题
    console.log(data)
    var self = this;
    data.owner ? self.setData({
      roomOwner: data.owner,
      counter: data.duration,
      stepCode: data.st
    }) : self.setData({
      counter: data.duration,
      stepCode: data.st
    })
    if (data.st == 1) {
      // 开始倒计时
      self.resetTimer()
      self.setData({ roomStatus: '开始倒计时...' })
    } else if (data.st == 2) {
      self.setData({ roomStatus: '开始答题...' })
      // 答题时间
      var pb = {
        content: data.data.content,
        choice: Array(),
        index: data.data.index
      }
      var ops = data.data.options;
      for (var i = 0; i < ops.length; ++i) {
        pb.choice.push({ idx: ops[i].idx, val: ops[i].val, cls: 'unselect' })
      }
      console.log(pb)
      self.setData({
        problem: pb,
        ready: true,
        choicedIdx: null
      })
      self.resetTimer()
    } else if (data.st == 3) {
      // 等待结果揭晓
      self.setData({ roomStatus: '等待结果...' })
    } else if (data.st == 4) {
      self.setData({ roomStatus: '结果揭晓...' })
      if (data.data.answer != self.data.choicedIdx) {
        var pb = self.data.problem
        for (var i = 0; i < pb.choice.length; ++i)
          if (i == data.data.answer) pb.choice[i].cls = 'selected'
          else if (i == self.data.choicedIdx) pb.choice[i].cls = 'wrong'
        self.setData({
          answerEnabled: false,
          roomMsg: '回答错误!',
          problem: pb
        })
      }
    } else if (data.st == 5) {
      self.setData({ roomStatus: '总结...' })
    } else if (data.st == 6) {
      self.setData({ roomStatus: '等待关闭...' })
    }
  },

  ezSendMsg: function (data, okFunc, failFunc) {
    var self = this;
    if (this.data.requesting) return false;
    this.data.wsConn.send({
      data: data,
      success: function (res) {
        console.log('Send data:' + data + ', success.')
        console.log(res)
        // 设置下一次响应执行的处理方法
        self.setData({ responseCallback: okFunc ? okFunc : (obj) => { self.setData({ roomMsg: '请求成功' }) } })
      },
      fail: function (res) {
        if (failFunc) failFunc(res)
        else console.log(res)
      }
    })
    return true;
  },

  startRoomTap: function (e) {
    var self = this;
    self.setData({ showStartBtn: false })
    self.ezSendMsg('{"t": 2}', (success, data) => { if (!success) self.setData({ roomMsg: data }) }, (obj) => { self.setData({ showStartBtn: true, roomMsg: '请求失败' }) })
  },

  clickChoiceTap: function (e) {
    var self = this;
    var d = this.data
    if (d.stepCode == 2 && d.choicedIdx === null && d.answerEnabled) {
      // 答题时间,并且本题之前没有回答过
      var pb = d.problem
      var answerIdx = parseInt(e.currentTarget.id);
      var choiced = pb.choice[answerIdx]
      // 发送答题请求
      this.ezSendMsg(
        '{"t":1, "d":{"q":' + pb.index + ', "a": ' + answerIdx + '}}',
        (success, obj) => {
          if (success) {
            choiced.cls = 'selected'
            self.setData({
              problem: pb,
              choicedIdx: answerIdx,
              roomMsg: '答题成功'
            })
          } else {
            self.setData({
              roomMsg: obj
            })
          }
        },
        (obj) => {
          self.setData({
            roomMsg: '答题失败',
          })
          self.data.choiceIdx = null
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
        } else if (obj.code == 2) {
          // 状态转换消息
          self.processStatusMessage(obj.data, false)
        } else if (obj.code == 200) {
          // 请求成功响应
          console.log('request success')
          self.data.responseCallback(true, obj.data)
          self.setData({
            responseCallback: null,
            requesting: false
          })
        } else if (obj.code == 500) {
          // 请求失败响应
          console.log('request failed.')
          self.data.responseCallback(false, obj.msg)
          self.setData({
            responseCallback: null,
            requesting: false
          })
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